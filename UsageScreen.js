import React from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  ScrollView,
  ViewPagerAndroid,
  Platform,
  Animated,
  TouchableOpacity
} from "react-native";
import {
  CollapsibleScrollView,
  MenuTabPanel,
  StyledText,
  CollapsibleMenuTabScenes,
  MyImage
} from "../../components/";
import { portStyles } from "./styles";
import { InfoPage, AddOnsPage, CalendarPage, PricingPage } from "./pages";
import { Metrics, Fonts } from "../../themes";
import I18n from "../../I18n/I18n";
import LoadingAndErrorScreen from "../LoadingAndErrorScreen";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedViewPagerAndroid = Animated.createAnimatedComponent(
  ViewPagerAndroid
);

const HeaderImages = (imageSources, imageProps, pageWidth) => {
  return imageSources.map((imageSource, index) => {
    return (
      <TouchableOpacity
        onPress={() => {
          imageProps.onPress(index);
        }}
        key={index}
        style={[
          portStyles.imageContainer,
          // imagePadding,
          { width: pageWidth }
        ]}
        activeOpacity={0.8}
      >
        <MyImage
          source={{ uri: imageSource.Url }}
          {...imageProps}
          style={portStyles.image}
        />
      </TouchableOpacity>
    );
  });
};

const headerComponent = props => {
  return (
    <View style={portStyles.headerContainer}>
      <ScrollView horizontal pagingEnabled bounces={false}>
        {HeaderImages(
          props.boatImagesSource,
          props.boatImagesProps,
          props.pageScrollView.pageWidth
        )}
      </ScrollView>
      <Animated.View
        pointerEvents="none"
        style={[
          portStyles.overviewContainer,
          { opacity: props.pageScrollView.overTopOpacity }
        ]}
      />
      <Animated.Text
        style={[
          portStyles.priceText,
          { opacity: props.pageScrollView.priceOpacity }
        ]}
      >
        <Animated.Text style={portStyles.priceUnitText}>
          {" "}
          {props.pageScrollView.preText}{" "}
        </Animated.Text>
        <Animated.Text style={portStyles.priceText}>
          {" "}
          € {props.pageScrollView.boatPrice}{" "}
        </Animated.Text>
        <Animated.Text style={portStyles.priceUnitText}>
          {props.pageScrollView.postText}
        </Animated.Text>
      </Animated.Text>
    </View>
  );
};

const UsageScreen = props => {
  return (
    <View style={{ flex: 1 }}>
      <CollapsibleMenuTabScenes
        {...props.pageScrollView}
        headerComponent={headerComponent(props)}
      >
        <InfoPage {...props.pageCommon} {...props.infoPage} />
        <AddOnsPage {...props.pageCommon} {...props.addOnsPage} />
        <CalendarPage {...props.pageCommon} {...props.calendarPage} />
        <PricingPage {...props.pageCommon} {...props.pricingPage} />
      </CollapsibleMenuTabScenes>
      {props.loadAndError.show && (
        <LoadingAndErrorScreen {...props.loadAndError} />
      )}
    </View>
  );
};

export default UsageScreen;
