import React, { Component } from 'react';
import Swiper from 'react-native-deck-swiper'
import { StyleSheet, Text, View, Image, AsyncStorage } from 'react-native';
import { Container, Button } from 'native-base';
import CustomHeader from '../components/customHeader';
import firebase from 'firebase';
import LottieView from 'lottie-react-native';
import dataLoading from '../../../assets/animation/dataloading.json';

export default class LikedBy extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      cards: [],
      cards_id: [],
      loading: true,
      date:'',
      nothing:false
    };
  }

  renderCard = (card, index) => {
    console.log(this.state.cards[index]);
    var today = new Date();
    var ageString = this.state.cards[index].dob;
    var yearOfBirth = ageString.substr(ageString.length - 5);
    return (
      <View style={styles.card}>
        <Image
          style={{ flex: 1, borderRadius: 5 }}
          source={{ uri: this.state.cards[index].profileImage }}
        />
        <View style={{ margin: 20 }}>
          <Text style={{ backgroundColor: 'transparent', fontSize: 22, }}>{this.state.cards[index].firstName} {this.state.cards[index].lastname}</Text>
          <Text style={{ backgroundColor: 'transparent', fontSize: 18, color: '#7f8c8d' }}>{ today.getFullYear()-parseInt(yearOfBirth)} yr</Text>
          <Text style={{ backgroundColor: 'transparent', fontSize: 17, color: '#7f8c8d' }}>{this.state.cards[index].city}, {this.state.cards[index].state}</Text>
        </View>
        <Button  style={{backgroundColor:'white',marginLeft:"40%",marginBottom:20}} onPress={() => this.props.navigation.navigate('CardDetails',{userData:this.state.cards[index],matched:false})}>
          <Text style={{color:'#8e44ad'}}>Know More</Text>
        </Button>
      </View>
    )
  };

  noCards = () => {
    return (
      <View style={styles.cardEmpty}>
        <Text style={styles.textEmpty}>No More Cards</Text>
      </View>
    );
  }

  componentWillMount = () => {
    var today = new Date();
    var date = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
    this.setState({date});
    
    AsyncStorage.getItem("fyp:auth:userId")
      .then((gotUserId) => {
        this.setState({ userId: gotUserId });
        var dataKey = [];
        let data = [];
        var promise = [];
        console.log(this.state.userId);
        firebase.database().ref('user/'+this.state.userId).once("value",(snapshot)=>{
          if(snapshot.hasChild("likedBy")){
            firebase.database().ref('user/' + this.state.userId + '/likedBy').once('value', (snapshot) => {
              snapshot.forEach((result) => {
                console.log("IS this running");
                console.log(result.key);
                dataKey.push(result.key);
                promise.push(firebase.database().ref('user').orderByKey().equalTo(result.key)
                  .once('value', (remainUserSnap) => {
                    remainUserSnap.forEach((resultedCard) => {
                      data.push(resultedCard.val());
                      console.log("All cards " + resultedCard.val());
                      this.setState({
                        cards: data,
                        cards_id: dataKey,
                        loading: false
                      });
                    })
                  }))
              });
            }).catch(e=>console.log("Error running"));
          }
          else{
            this.setState({nothing:true});
          }
        });
        
      })
      .catch((error) => {
        console.log("Something went wrong"+error);
        this.props.navigation.replace('Login');
      });
  }

  render() {
    return (
      <Container>
        <CustomHeader title="Liked By" drawerOpen={() => this.props.navigation.openDrawer()} textColor="#8e44ad" backgroundColor="white" />
        {this.state.loading == false ?
          <View style={styles.container}>
            <Swiper
              ref={swiper => {
                this.swiper = swiper
              }}
              backgroundColor='white'
              onSwipedAll={this.noCards}
              onSwiped={this.onSwiped}
              onTapCard={this.swipeLeft}
              cards={this.state.cards}
              cardIndex={this.state.cardIndex}
              cardVerticalMargin={80}
              renderCard={this.renderCard}
              onTapCard={()=>console.log("Card Tapped")}
              onSwipedAll={this.onSwipedAllCards}
              stackSize={3}
              verticalSwipe={false}
              onSwipedLeft={
                (index) => {
                  firebase.database().ref('user/'+this.state.userId+'/nope/'+this.state.cards_id[index])
                  .set(
                    {
                      date:this.state.date
                    }
                  ).then(()=>console.log("Inserted nope of my data"))
                  .catch((e)=>console.log("went wrong in iserting nope in my data"));
                  firebase.database().ref('user/'+this.state.userId+'/likedBy/'+this.state.cards_id[index]).remove();
                }
              }
              onSwipedRight={
                (index) => {
                  firebase.database().ref('user/'+this.state.userId+'/matchedWith/'+this.state.cards_id[index])
                  .set(
                    {
                      date:this.state.date
                    }
                  ).then(()=>console.log("Macthed with Inserted in my data"))
                  .catch((e)=>console.log("matched with not inserted in my database"));
                  firebase.database().ref('user/'+this.state.cards_id[index]+'/matchedWith/'+this.state.userId)
                  .set(
                    {
                      date:this.state.date
                    }
                  ).then(()=>console.log("Macthed with Inserted in Card Data"))
                  .catch((e)=>console.log("matched with not inserted in card database"));
                  firebase.database().ref('user/'+this.state.userId+'/likedBy/'+this.state.cards_id[index]).remove();
                  firebase.database().ref('user/'+this.state.cards_id[index]+'/like/'+this.state.userId).remove();
                  
                }
              }
              stackSeparation={15}
              overlayLabels={{
                bottom: {
                  title: 'UGH..',
                  style: {
                    label: {
                      backgroundColor: '#2c3e50',
                      borderColor: '#2c3e50',
                      color: 'white',
                      borderWidth: 1
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }
                },
                left: {
                  title: 'REJECT',
                  style: {
                    label: {
                      backgroundColor: '#c0392b',
                      borderColor: '#c0392b',
                      color: 'white',
                      borderWidth: 1
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: -30
                    }
                  }
                },
                right: {
                  title: 'ACCEPT',
                  style: {
                    label: {
                      backgroundColor: '#00b894',
                      borderColor: '#00b894',
                      color: 'white',
                      borderWidth: 1
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: 30
                    }
                  }
                },
                top: {
                  title: 'SUPER LIKE',
                  style: {
                    label: {
                      backgroundColor: '#6c5ce7',
                      borderColor: '#6c5ce7',
                      color: 'white',
                      borderWidth: 1
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }
                }
              }}
              animateOverlayLabelsOpacity
              animateCardOpacity
            >
            </Swiper>
          </View> :
          <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'white'
          }}>
          {this.state.nothing ?
          <Text style={{color:'#c0392b',fontSize:28,fontWeight:'600',textAlign:'center',letterSpacing:2}}>Nobody Found</Text>:<LottieView
            source={dataLoading}
            autoPlay
            loop
            style={{ }}
          />}
          
        </View>
        }
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  card: {
    flex: 0.8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: 'white'
  },
  cardEmpty: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    backgroundColor: "red"
  },
  textEmpty: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent"
  },
  text: {
    textAlign: 'center',
    fontSize: 50,
    backgroundColor: 'transparent'
  },
  done: {
    textAlign: 'center',
    fontSize: 30,
    color: 'white',
    backgroundColor: 'transparent'
  }
})