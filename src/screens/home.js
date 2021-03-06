import React, { Component } from 'react'
import Swiper from 'react-native-deck-swiper'
import { StyleSheet, Text, View, Image } from 'react-native';
import { Container, Button } from 'native-base';
import CustomHeader from './components/customHeader';
import LottieView from 'lottie-react-native';
import dataLoading from '../../assets/animation/dataloading.json';
import firebase from 'firebase';
import LogoutScreen from './logout';
import MatchedScreen from './match/matched';
import { DrawerNavigator } from 'react-navigation';
import ProfileScreen from './profile';
import fireworks from '../../assets/animation/fireworks.json';

var _ = require('lodash');


class HomeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cards_id: [],
      cards: [],
      swipedAllCards: false,
      swipeDirection: '',
      isSwipingBack: false,
      cardIndex: 0,
      userId: this.props.navigation.state.params.userId,
      date: "",
      loading: true,
      nothing: false
    }
  }

  renderCard = (card, index) => {
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
          <Text style={{ backgroundColor: 'transparent', fontSize: 18, color: '#7f8c8d' }}>{today.getFullYear() - parseInt(yearOfBirth)} yr</Text>
          <Text style={{ backgroundColor: 'transparent', fontSize: 17, color: '#7f8c8d' }}>{this.state.cards[index].city}, {this.state.cards[index].state}</Text>
        </View>
        <Button style={{ backgroundColor: 'white', marginLeft: "40%", marginBottom: 20 }} onPress={() => this.props.navigation.navigate('CardDetails', { userData: this.state.cards[index], matched: false })}>
          <Text style={{ color: '#8e44ad' }}>Know More</Text>
        </Button>
      </View>
    )
  }

  noCards = () => {
    console.log("All card Swiped");
    this.setState({ loading: true });
    this.setState({ nothing: true });
  }

  componentWillMount = () => {
    // var dataKey = [];
    // firebase.database().ref('user').on('value', (snapshot) => {
    //   snapshot.forEach((child) => { dataKey.push(child.key); console.log(child.key); });
    //   let data = snapshot.val();
    //   console.log(dataKey);
    //   let items = Object.values(data);
    //   this.setState({ cards: items });
    //   this.setState({ cards_id: dataKey });
    // });
    var today = new Date();
    var date = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
    this.setState({ date });

    var cardList = [];
    var finalCardListKey = [];
    var cardFilteredkey = [];
    var promisesFirst = [];
    var myGender = '';
    promisesFirst.push(firebase.database().ref('user').once('value', (data) => {
      data.forEach((result) => {
        if (result.key === this.state.userId) {
          myGender = result.val().gender;
        }
      }
      );
      data.forEach((result) => {
        console.log("My Gender" + myGender);
        if ((result.key !== this.state.userId) && (myGender !== result.val().gender)) {
          cardFilteredkey.push({
            key: result.key
          })
        }
      });
    }));

    Promise.all(promisesFirst).then((res) => {
      var promiseSecond = [];
      promiseSecond.push(firebase.database().ref('user/' + this.state.userId + '/nope').once('value', (data1) => {
        data1.forEach((child1) => {
          for (var key in cardFilteredkey) {
            console.log("cardFilteredkey[key].key" + cardFilteredkey[key].key);
            if (cardFilteredkey[key].key === child1.key) {
              cardFilteredkey = _.omit(cardFilteredkey, key);
            }
          }
        })
      }));

      promiseSecond.push(firebase.database().ref('user/' + this.state.userId + '/nopedBy').once('value', (data2) => {
        data2.forEach((child2) => {
          for (var key in cardFilteredkey) {
            if (cardFilteredkey[key].key === child2.key) {
              cardFilteredkey = _.omit(cardFilteredkey, key);
            }
          }
        })
      }));

      promiseSecond.push(firebase.database().ref('user/' + this.state.userId + '/like').once('value', (data2) => {
        data2.forEach((child2) => {
          for (var key in cardFilteredkey) {
            if (cardFilteredkey[key].key === child2.key) {
              cardFilteredkey = _.omit(cardFilteredkey, key);
            }
          }
        })
      }));

      promiseSecond.push(firebase.database().ref('user/' + this.state.userId + '/likedBy').once('value', (data2) => {
        data2.forEach((child2) => {
          for (var key in cardFilteredkey) {
            if (cardFilteredkey[key].key === child2.key) {
              cardFilteredkey = _.omit(cardFilteredkey, key);
            }
          }
        })
      }));

      promiseSecond.push(firebase.database().ref('user/' + this.state.userId + '/matchedWith').once('value', (data2) => {
        data2.forEach((child2) => {
          for (var key in cardFilteredkey) {
            if (cardFilteredkey[key].key === child2.key) {
              cardFilteredkey = _.omit(cardFilteredkey, key);
            }
          }
        })
      }));

      Promise.all(promiseSecond).then((res) => {
        for (key in cardFilteredkey) {
          finalCardListKey.push(cardFilteredkey[key].key);
          firebase.database().ref('user').orderByKey().equalTo(cardFilteredkey[key].key)
            .once('value', (remainUserSnap) => {
              remainUserSnap.forEach((resultedCard) => {
                cardList.push(resultedCard.val());
                this.setState({ cards: cardList });
              })
            })
        }
        this.setState({ cards_id: finalCardListKey });
        this.setState({ loading: false });
        if (this.state.cards.length < 0) {
          this.setState({ loading: true });
          this.setState({ nothing: true });
          console.log("chek");
        }
      });
    });

  }

  swipeBack = () => {
    if (!this.state.isSwipingBack) {
      this.setIsSwipingBack(true, () => {
        this.swiper.swipeBack(() => {
          this.setIsSwipingBack(false)
        })
      })
    }
  };

  setIsSwipingBack = (isSwipingBack, cb) => {
    this.setState(
      {
        isSwipingBack: isSwipingBack
      },
      cb
    )
  };

  swipeLeft = () => {
    this.swiper.swipeLeft()
  };

  render() {
    return (
      <Container>
        <CustomHeader title="HOME" drawerOpen={() => this.props.navigation.openDrawer()} textColor="#8e44ad" backgroundColor="white" />
        {this.state.loading == false ?
          <View style={styles.container}>
            {this.state.cards.length > 0 ? <Swiper
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
              stackSize={3}
              onTapCard={() => console.log("Card Tapped")}
              verticalSwipe={false}
              onSwipedLeft={
                (index) => {
                  console.log("------------ Noped BY User query is starting ------------");
                  console.log(this.state.cards_id[index]);
                  firebase.database().ref('user/' + this.state.cards_id[index] + '/nopedBy/' + this.state.userId)
                    .set({ date: this.state.date })
                    .then(() => console.log("NopedBy Inserted"));
                  firebase.database().ref('user/' + this.state.userId + '/nope/' + this.state.cards_id[index])
                    .set({ date: this.state.date })
                    .then(() => console.log("My Nope"));
                }
              }
              onSwipedRight={
                (index) => {
                  console.log("------------ Liked BY User query is starting ------------");
                  console.log(this.state.cards_id[index]);
                  firebase.database().ref('user/' + this.state.cards_id[index] + '/likedBy/' + this.state.userId)
                    .set({ date: this.state.date })
                    .then(() => console.log("LikedBy Inserted"));
                  firebase.database().ref('user/' + this.state.userId + '/like/' + this.state.cards_id[index])
                    .set({ date: this.state.date })
                    .then(() => console.log("My Like"));
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
                  title: 'NOPE',
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
                  title: 'LIKE',
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
            </Swiper> : <View>
                <Text style={{ fontSize: 25, color: '#8e44ad', textAlign: 'center', marginTop: 20 }}>All Cards Finished</Text>
                <View
                  style={{
                    height: '80%',
                    width: '100%',
                    marginTop: '10%'
                  }}>
                  <LottieView
                    source={fireworks}
                    autoPlay
                    loop
                    style={{}}
                  />
                </View>
              </View>}
          </View> :
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'white'
            }}>

            {this.state.nothing ? <View>
                <Text style={{ fontSize: 25, color: '#8e44ad', textAlign: 'center', marginTop: 20 }}>All Cards Swiped</Text>
                <View
                  style={{
                    height: '80%',
                    width: '100%',
                    marginTop: '10%'
                  }}>
                  <LottieView
                    source={fireworks}
                    autoPlay
                    loop
                    style={{}}
                  />
                </View>
              </View> : <LottieView
              source={dataLoading}
              autoPlay
              loop
              style={{}}
            />}
          </View>
        }
      </Container>
    )
  }
}

export default MyApp = DrawerNavigator({
  Home: {
    screen: HomeScreen,
  },
  Matched: {
    screen: MatchedScreen,
  },
  Profile: {
    screen: ProfileScreen
  },
  Logout: {
    screen: LogoutScreen,
  },
});

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