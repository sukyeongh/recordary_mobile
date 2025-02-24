import React, {useLayoutEffect, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

export default function ListComponent({navigation, route}) {
  console.log(route.params.userInfo);
  const [userList, setUserList] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.isGroup
        ? '그룹 멤버'
        : route.params.isFollow
        ? '팔로워'
        : '팔로우',
      headerStyle: {
        backgroundColor: route.params.isGroup ? 'tomato' : 'rgb(64, 114, 89)',
      },
    });
  }, []);

  useEffect(() => {
    route.params.isGroup
      ? getGroupMemberList()
      : route.params.isFollow
      ? getFollowerList()
      : getFollowingList();
  }, []);

  const getFollowerList = async () => {
    const {data} = await axios.get(
      `http://ec2-15-165-140-48.ap-northeast-2.compute.amazonaws.com:8080/follower/${route.params.userInfo.userCd}`,
    );
    console.log(data);
    setUserList(data);
  };
  const getFollowingList = async () => {
    const {data} = await axios.get(
      `http://ec2-15-165-140-48.ap-northeast-2.compute.amazonaws.com:8080/following/${route.params.userInfo.userCd}`,
    );
    setUserList(data);
  };
  const getGroupMemberList = async () => {
    setUserList(route.params.userInfo);
  };

  return (
    <View>
      {userList.length > 0 ? (
        userList.map((value, index) => (
          <View style={styles.spaceBetween} key={`${value.userCd}-${index}`}>
            <TouchableOpacity>
              <View style={[styles.flexRow, {margin: 5}]}>
                <Image
                  source={{
                    uri: value.userPic,
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    resizeMode: 'cover',
                    borderRadius: 50,
                  }}
                />
                <Text style={{padding: 10, fontSize: 18}}>
                  {value.userId}({value.userNm})
                </Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity>
              <MaterialIcons
                style={{padding: 10}}
                name="add"
                size={30}
                // color="rgb(64, 114, 89)"
                color="black"
              />
            </TouchableOpacity> */}
          </View>
        ))
      ) : (
        <Text style={{margin: 10, fontSize: 15}}>
          {route.params.isGroup
            ? '그룹 멤버가 존재하지 않습니다.'
            : route.params.isFollow
            ? '팔로워가 없습니다.'
            : '팔로잉한 사용자가 없습니다.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
