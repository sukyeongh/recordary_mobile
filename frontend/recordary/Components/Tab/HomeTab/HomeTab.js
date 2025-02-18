import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';

import axios from 'axios';

import Timeline from './Timeline';
import OnlyPostExTimeline from './OnlyPostExTimeline';
import TimelineOneDay from './TimelineOneDay';
import TimelineMultiDay from './TimelineMultiDay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';

const Stack = createStackNavigator();

const HomeTab = ({user}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={Home}
        initialParams={{
          user: user,
        }}
      />
    </Stack.Navigator>
  );
};

const Home = ({navigation, route}) => {
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  useEffect(() => {
    getFirstTimelineData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: (
        <Image
          style={{height: 30, width: 100}}
          resizeMode="cover"
          source={require('../../../Static/logo.png')}
        />
      ),
      headerStyle: {backgroundColor: 'rgb(64, 114, 89)'},
      headerTintColor: 'white',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 24,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.openDrawer();
          }}>
          <Text style={{padding: 10}}>
            <MaterialCommunityIcons name="menu" size={34} color="white" />
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('homeSearch', {user: route.params.user});
          }}>
          <Text style={{padding: 10, marginTop: 5, marginRight: 5}}>
            <MaterialIcons name="search" size={25} color="white" />
          </Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  const getFirstTimelineData = async () => {
    try {
      const timeLineDataList = (
        await axios.get(
          `http://ec2-15-165-140-48.ap-northeast-2.compute.amazonaws.com:8080/post/pagingTimeLine/${route.params.user.userCd}`,
        )
      ).data;
      setIsLoading(true);
      if (timeLineDataList.length < 0) {
        return;
      } else {
        setTimeline(timeLineDataList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const getMoreTimelineData = async () => {
    try {
      const moreTimeLineData = (
        await axios.get(
          `http://ec2-15-165-140-48.ap-northeast-2.compute.amazonaws.com:8080/post/pagingTimeLine/${route.params.user.userCd}`,
          {
            params: {lastCd: timeline[timeline.length - 1].postCd},
          },
        )
      ).data;
      if (moreTimeLineData.length <= 0) {
        return;
      } else {
        setTimeline(timeline.concat(moreTimeLineData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <FlatList
      style={styles.container}
      keyExtractor={(val) => val.postCd}
      data={timeline}
      renderItem={({item}) => {
        if (item.mediaFK !== null) {
          return <Timeline postList={item} user={route.params.user} />;
        } else if (item.scheduleFK !== null) {
          return <TimelineOneDay postList={item} user={route.params.user} />;
        } else if (item.shareScheduleList.length > 0) {
          return <TimelineMultiDay postList={item} user={route.params.user} />;
        } else if (item.postOriginFK === null) {
          return (
            <OnlyPostExTimeline postList={item} user={route.params.user} />
          );
        } else return null;
      }}
      onEndReached={() => {
        getMoreTimelineData();
      }}
      ListFooterComponent={() =>
        isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        getFirstTimelineData();
      }}
    />
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#eee',
  },
  post: {
    padding: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  spaceBetween: {
    paddingLeft: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  postImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').width * 0.9,
    resizeMode: 'cover',
    margin: 5,
  },
  commentImage: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    borderRadius: 50,
  },
  oneSchedule: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
    height: 40,
  },
  loader: {
    marginTop: 10,
    alignItems: 'center',
  },
});
