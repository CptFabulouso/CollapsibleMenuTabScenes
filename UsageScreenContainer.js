import React, { Component } from "react";
import { InteractionManager, Animated, StyleSheet } from "react-native";
import UsageScreen from "./UsageScreen";
import { connect } from "react-redux";

import I18n from "../../I18n/I18n";
import {} from "../../actions";
import {
  ORIENTATION_PORTRAIT,
  ORIENTATION_LANDSCAPE
} from "../../config/constants";
import LoadingAndErrorScreen from "../LoadingAndErrorScreen";
import { Metrics, Colors } from "../../themes";

class UsageScreenContainer extends Component {
  constructor(props) {
    super(props);

    this.getHeaderHeight = this.getHeaderHeight.bind(this);
    this.navigateToAddons = this.navigateToAddons.bind(this);
    this.make = this.make.bind(this);
    this.add = this.add.bind(this);
    this.edit = this.edit.bind(this);
    this.onImagePress = this.onImagePress.bind(this);
    this.onRetryPress = this.onRetryPress.bind(this);
    this.setPageHeight = this.setPageHeight.bind(this);
    this.getPrice = this.getPrice.bind(this);
    this.getButtonActions = this.getButtonActions.bind(this);

    this.state = {
      headerScrollValue: new Animated.Value(0),
      headerHeight: 0,
      pageLoaded: false,
      interactionsComplete: false,
      pagesHeight: [0, 0, 0, 0]
    };

    this.menuTabScenesRef = null;
    this.alertShown = false;
    this.blockShowingScreen = false;

    this.screenId = Math.floor(Math.random() * 1000000); //debug
  }

  componentDidMount() {
    this.props.screenMounted("DetailsScreen", this.screenId); //debug

    InteractionManager.runAfterInteractions(() => {
      this.setState({ pageLoaded: true });
      if (this.props.editing) {
        this.props.openForEdit(this.props.ToEdit);
      } else {
        let preselectedDays = this.props.preselectedDays
          ? this.props.preselectedDays
          : null;
        this.props.openNew(this.props.Id, preselectedDays);
      }
    });
  }

  componentWillUnmount() {
    this.props.screenUnmounted("DetailsScreen", this.screenId); //debug
  }

  getHeaderHeight(height) {
    this.setState({ headerHeight: height });
  }

  onRetryPress() {}

  make() {}

  add() {}

  edit() {}

  navigateToAddons() {
    this.menuTabScenesRef.onMenuSelect(1);
  }

  onImagePress(index) {}

  setPageHeight(index, height) {}

  getPrice() {}

  getButtonActions() {}

  render() {
    // console.log("render DetailsScreen", this.props)

    //načítá se creating
    if (!this.state.pageLoaded) {
      return (
        <LoadingAndErrorScreen
          loading={!this.state.pageLoaded}
          loadingMessage={I18n.t("loadings")}
        />
      );
    }

    //nastavení opacity Price textu
    let navBarHeight = Metrics.navBarHeightPort;
    if (
      this.props.orientation === ORIENTATION_LANDSCAPE &&
      !this.props.isTablet
    ) {
      navBarHeight = Metrics.navBarHeightLand;
    }
    const stickyHeaderHeight = navBarHeight + Metrics.menuTabHeight;
    const headerDistance = this.state.headerHeight - stickyHeaderHeight;
    let priceOpacity = 1;
    let overTopOpacity = 0;
    if (headerDistance > 0) {
      priceOpacity = this.state.headerScrollValue.interpolate({
        inputRange: [(headerDistance * 5) / 10, (headerDistance * 8) / 10],
        outputRange: [1, 0],
        extrapolate: "clamp"
      });
      overTopOpacity = this.state.headerScrollValue.interpolate({
        inputRange: [(headerDistance * 5) / 10, (headerDistance * 8) / 10],
        outputRange: [0, 0.6],
        extrapolate: "clamp"
      });
    }

    let initialDate = null;
    if (
      this.props.preselectedDays &&
      this.props.preselectedDays.hasOwnProperty("From")
    ) {
      initialDate = this.props.preselectedDays.From;
    }
    if (this.props.editing) {
      initialDate = new Date(this.props.ToEdit.Times[0].From);
    }

    const newProps = {
      ImagesProps: {
        resizeMode: "cover",
        onPress: this.onImagePress
      },
      ImagesSource: [
        {
          Url: this.props.PictureUrl
        },
        ...this.props.Pictures
      ],
      pageScrollView: {
        stickyHeaderHeight: stickyHeaderHeight,
        getHeaderHeight: this.getHeaderHeight,
        initialPage: 2,
        getHeaderScrollAnimatedValue: this.state.headerScrollValue,
        pageWidth: this.props.screenWidth,
        menuPosition: "top",
        activeTintColor: Colors.activeMenuColor,
        inactiveTintColor: Colors.inactiveMenuColor,
        bottomIndicatorColor: Colors.primaryColor,
        priceOpacity: priceOpacity,
        overTopOpacity: overTopOpacity,
        preText: this.props.TotalAmount > 0 ? "Total Price: " : "",
        Price: this.getPrice(),
        postText: this.props.TotalAmount > 0 ? "" : " / day",
        ref: instance => {
          this.menuTabScenesRef = instance;
        }
      },
      pageCommon: {
        Id: this.props.Id,
        editAdding: this.props.editAdding,
        editing: this.props.editing,
        inputsDisabled:
          this.props.creating || this.props.adding || this.props.editing
      },
      infoPage: {
        title: I18n.t("menuInfo"),
        onLayout: event => {
          this.setPageHeight(0, event.nativeEvent.layout.height);
        }
      },
      addOnsPage: {
        title: I18n.t("menuAddOns"),
        badgeValue: this.props.totalQuantity,
        onLayout: event => {
          this.setPageHeight(1, event.nativeEvent.layout.height);
        },
        edit: this.edit,
        getButtonActions: this.getButtonActions
      },
      calendarPage: {
        initialDate,
        title: I18n.t("menuCalendar"),
        badgeValue: this.props.totalNumberOfDays,
        navigateToAddons: this.navigateToAddons,
        getButtonActions: this.getButtonActions,
        make: this.make,
        add: this.add,
        edit: this.edit,
        onLayout: event => {
          this.setPageHeight(2, event.nativeEvent.layout.height);
        }
      },
      pricingPage: {
        title: I18n.t("menuPricing"),
        navigateToAddons: this.navigateToAddons,
        getButtonActions: this.getButtonActions,
        make: this.make,
        add: this.add,
        edit: this.edit,
        onLayout: event => {
          this.setPageHeight(3, event.nativeEvent.layout.height);
        }
      },
      loadAndError: {
        show: !this.state.pageLoaded || this.props.loading || this.props.error,
        // show:true,
        loading: !this.state.pageLoaded || this.props.loading,
        error: this.props.error,
        loadingMessage: I18n.t("loadings"),
        errorMessages: this.props.msg,
        onRetryPress: this.onRetryPress,
        style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
      }
    };

    return <UsageScreen {...this.props} {...newProps} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.primaryColor
  },

  text: {
    textAlign: "center",
    color: Colors.primaryColor
  },

  fill: {
    flex: 1
  }
});

const mapStateToProps = state => {
  const { orientation, screenWidth, isTablet } = state.app;
  const {
    error,
    msg,
    loading,
    PictureUrl,
    TotalAmount,
    Price,
    errorPrice,
    Pictures,
    loadingPrice
  } = state.selected;
  const { totalNumberOfDays } = state.Input.selectedDays;
  const {
    creating,
    errorCreatingcreating,
    errorCreatingcreatingMsg,
    adding,
    errorAdding,
    errorAddingMsg,
    editing
  } = state.selectedcreating;
  const { totalQuantity } = state.Input.selectedAddons;

  return {
    orientation,
    screenWidth,
    isTablet,
    error,
    msg,
    loading,
    PictureUrl,
    totalNumberOfDays,
    totalQuantity,
    TotalAmount,
    Price,
    errorPrice,
    creating,
    errorCreatingcreating,
    errorCreatingcreatingMsg,
    editing,
    adding,
    errorAdding,
    errorAddingMsg,
    Pictures,
    loadingPrice
  };
};

export default connect(mapStateToProps, {})(UsageScreenContainer);
