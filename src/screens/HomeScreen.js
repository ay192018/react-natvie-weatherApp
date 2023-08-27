import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native"
import React, { useState, useCallback, useEffect } from "react"
import { theme } from "../theme"
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline"
import { MapPinIcon } from "react-native-heroicons/solid"
import { debounce } from "lodash"
import { fetchLocations, fetchWeatherForecast } from "../api/weather"
import { weatherImages } from "../constants"
import * as Progress from "react-native-progress"
import { getData, storeData } from "../utils/asyncStorage"
export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState({})
  const [loading, setLoding] = useState(true)
  const handleLocation = (loc) => {
    setLocations([])
    toggleSearch(false)
    setLoding(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data)
      setLoding(false)
      storeData("city", loc.name)
    })
  }
  const handleSearch = (val) => {
    if (val.length) {
      fetchLocations({ cityName: val }).then((data) => {
        setLocations(data)
      })
    }
  }
  useEffect(() => {
    fetchMyWeatherData()
  }, [])
  const fetchMyWeatherData = async () => {
    let myCity = await getData("city")
    let cityName = "shenzhen"
    if (myCity) cityName = myCity
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      console.log(data)
      setWeather(data)
      setLoding(false)
    })
  }
  const handleTextDebounce = useCallback(debounce(handleSearch, 500), [])
  const { current, location } = weather

  return (
    <View style={{ position: "relative", flex: 1 }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../../assets/images/bg.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      {loading ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Progress.CircleSnail thickness={10} size={140} color="#ff6700" />
          <Text style={{ color: "white", fontSize: 40 }}>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              height: "7%",
              position: "relative",
              zIndex: 50,
              marginHorizontal: 15,
            }}
          >
            <View
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                borderRadius: 100,
              }}
            >
              {showSearch ? (
                <TextInput
                  placeholder="搜索城市"
                  onChangeText={handleTextDebounce}
                  placeholderTextColor={"lightgray"}
                  style={{
                    flex: 1,
                    height: 30,
                    paddingLeft: 6,
                    fontSize: 16,
                    color: "white",
                    paddingBottom: 1,
                  }}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{
                  backgroundColor: theme.bgWhite(0.3),
                  padding: 10,
                  margin: 1,
                  borderRadius: 100,
                }}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  backgroundColor: "#d1d5db",
                  top: 50,
                  borderRadius: 30,
                }}
              >
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length
                  const border = showBorder
                    ? {
                        borderBottomWidth: 1,
                        borderColor: "#9ca3af",
                      }
                    : null
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 0,
                        padding: 15,
                        paddingHorizontal: 16,

                        borderRadius: 2,
                        ...border,
                      }}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text
                        style={{ color: "black", fontSize: 24, marginLeft: 2 }}
                      >
                        {loc?.name},{loc?.country}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : null}
          </View>
          <View
            style={{
              marginHorizontal: 10,
              justifyContent: "space-around",
              flex: 1,
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 23,
                fontWeight: "bold",
              }}
            >
              {location?.name},
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#d1d5db" }}
              >
                {" " + location?.country}
              </Text>
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Image
                source={weatherImages[current?.condition?.text]}
                style={{ width: 150, height: 150 }}
              />
            </View>
            <View style={{ marginVertical: 2 }}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "white",
                  fontSize: 40,
                  marginLeft: 5,
                }}
              >
                {current?.temp_c}
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#d1d5db",
                  fontSize: 18,
                  marginLeft: 5,
                }}
              >
                {current?.condition?.text}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/icons/wind.png")}
                  style={{ height: 24, width: 24, marginRight: 5 }}
                />
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {current?.wind_kph}km
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: 2,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/icons/drop.png")}
                  style={{ height: 24, width: 24, marginRight: 5 }}
                />
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {current?.humidity}%
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: 2,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/icons/sun.png")}
                  style={{ height: 24, width: 24, marginRight: 5 }}
                />
                <Text style={{ color: "white", fontWeight: "600" }}>
                  6:05下午
                </Text>
              </View>
            </View>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                gap: 5,
                paddingLeft: 10,
              }}
            >
              <CalendarDaysIcon size={22} color={"white"} />
              <Text style={{ color: "white" }}>每日天气</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date)
                let options = { weekday: "long" }
                let dayName = date.toLocaleDateString("zh", options)
                dayName = dayName.split("日")[1]
                return (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: 80,
                      borderRadius: 15,
                      padding: 12,
                      backgroundColor: theme.bgWhite(0.15),
                      marginRight: 10,
                    }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      style={{ height: 40, width: 40 }}
                    />
                    <Text style={{ color: "white" }}>{dayName}</Text>
                    <Text
                      style={{ color: "white", fontSize: 13, fontWeight: 600 }}
                    >
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  )
}
