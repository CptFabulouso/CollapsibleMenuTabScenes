import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Platform,
  ViewPropTypes
} from "react-native";
import PropTypes from "prop-types";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TabViewAnimated, TabBar } from "react-native-tab-view";

import styles from "./styles/CollapsibleMenuTabScenesStyle";
import ScrollPage from "./ScrollPage";
import HorizontalPanResponder from "./HorizontalPanResponder";
import { MenuTabPanel } from "../MenuTabPanel/";
import { StyledText } from "../StyledText";
import { Fonts, Metrics, Colors } from "../../themes";

const AnimatedScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

class CollapsibleMenuTabScenes extends Component {
  constructor(props) {
    super(props);
    this.onScrolledToPage = this.onScrolledToPage.bind(this);
    this.onPageScrollEnd = this.onPageScrollEnd.bind(this);
    this.setHeaderLayout = this.setHeaderLayout.bind(this);
    this.setContainerLayout = this.setContainerLayout.bind(this);
    this.trackScrollPosition = this.trackScrollPosition.bind(this);
    this.onMenuSelect = this.onMenuSelect.bind(this);

    const scroll = props.getHeaderScrollAnimatedValue
      ? props.getHeaderScrollAnimatedValue
      : new Animated.Value(0);

    this.state = {
      headerTranslate: scroll,
      selectedPage: props.initialPage,
      maxHeaderHeight: props.maxHeaderHeight,
      headerDistance: props.maxHeaderHeight - props.stickyHeaderHeight,
      pageScrollX: new Animated.Value(0),
      scrolledToInitalPage: false,

      containerWidth: this.props.pageWidth,
      containerHeight: this.props.pageHeight,
      orientation: "portrait",
      sceneLoaded: false,

      movingHorizontally: false
    };

    (this._minPageHeight = 0), (this._headerYDistance = 0);
    this._horizontalScrollView = null;
    const childLength = Array.isArray(props.children)
      ? props.children.length
      : 1;
    this.references = [];
    for (let i = 0; i < childLength; i++) {
      this.references.push(null);
    }
    this._scrolledToInitalPage = false;

    this._scrollXPosition = 0;
    this._tempMaxHeaderHeight = null;
    this._tempContainerHeight = null;
    this._tempContainerWidth = null;
  }

  componentDidMount() {
    this.state.headerTranslate.addListener(({ value }) => {
      this._headerYDistance = value;
      // console.log("Header Translate Listener", value)
    });
  }

  componentWillUnmount() {
    this.state.headerTranslate.removeAllListeners();
  }

  onScrolledToPage(event) {
    // console.log("onScrolledToPage")
    // const containerWidth = Metrics.screenWidth;
    const containerWidth = this.state.containerWidth;
    const selectedPage = Math.round(
      event.nativeEvent.contentOffset.x / containerWidth
    );
    this.setState({ selectedPage });
  }

  onPageScrollEnd(event) {
    // console.log("onPageScrollEnd", event.nativeEvent)
    this.scrollPages(event.nativeEvent.contentOffset.y);
  }

  scrollPages(yOffset, skipSelectedPage = true, animated = false) {
    if (yOffset < 0) {
      return;
    }
    // console.log("scrollPages", yOffset, this.state.selectedPage)
    for (let i = 0; i < this.references.length; i++) {
      if (skipSelectedPage && i === this.state.selectedPage) {
        //skip selected page
        continue;
      }
      if (this.references[i]) {
        this.references[i].scrollToPosition(yOffset, animated);
      }
    }
  }

  recalculateLayout() {
    if (
      this._tempMaxHeaderHeight !== null &&
      this._tempContainerHeight !== null
    ) {
      //header
      const headerDistance =
        this._tempMaxHeaderHeight - this.props.stickyHeaderHeight;

      //body
      if (this._minPageHeight === 0) {
        //větší rozměr komponenty
        const containerHeight = Math.max(
          this._tempContainerHeight,
          this._tempContainerWidth
        );
        this._minPageHeight = containerHeight - this.props.stickyHeaderHeight;
      }
      const visiblePageheight =
        this._tempContainerHeight -
        this._headerYDistance -
        this.props.stickyHeaderHeight;
      let orientation = "portrait";
      if (this._tempContainerWidth > this._tempContainerHeight) {
        orientation = "landscape";
        //landscape mod, posuň headeru nahoru ať nezavazí
        if (this._tempContainerHeight - this._tempMaxHeaderHeight < 100) {
          // console.log("SCROLL TO TOP", headerDistance)
          // this.scrollPages(headerDistance, false, true)
        }
      }

      //nastav stav a posuň stránku na správnou pozici
      this.setState(
        {
          maxHeaderHeight: this._tempMaxHeaderHeight,
          headerDistance,
          containerWidth: this._tempContainerWidth,
          containerHeight: this._tempContainerHeight,
          orientation,
          sceneLoaded: true
        },
        () => {
          setTimeout(() => {
            if (
              orientation === "landscape" &&
              this._tempContainerHeight - this._tempMaxHeaderHeight < 100
            ) {
              this.scrollPages(headerDistance, false, true);
            }
            this.scrollToPage(
              this.state.selectedPage,
              this._tempContainerWidth,
              false
            );
          }, 50);
        }
      );
    }
  }

  setHeaderLayout(event) {
    const headerHeight = event.nativeEvent.layout.height;
    this._tempMaxHeaderHeight = event.nativeEvent.layout.height;
    if (this.state.maxHeaderHeight !== headerHeight) {
      this.recalculateLayout();
      if (this.props.getHeaderHeight) {
        this.props.getHeaderHeight(headerHeight);
      }
    }
  }

  setContainerLayout(event) {
    if (
      this._tempContainerWidth === null ||
      event.nativeEvent.layout.width !== this.state.containerWidth
    ) {
      this._tempContainerWidth = event.nativeEvent.layout.width;
      this._tempContainerHeight = event.nativeEvent.layout.height;
      this.recalculateLayout();
    }
  }

  trackScrollPosition(event) {
    // console.log("trackScrollPosition")
    const pageWidth = this.state.containerWidth;
    this._scrollXPosition = event.nativeEvent.contentOffset.x;
    if (
      this.state.selectedPage !== Math.round(this._scrollXPosition / pageWidth)
    ) {
      // const seletedPage = Math.round(this._scrollXPosition/pageWidth)
      // this.newMenuSelected(seletedPage)
      if (this._dragging) {
        // console.log("new selected menu index", this._scrollXPosition/pageWidth)
        this.setState({
          selectedPage: Math.round(this._scrollXPosition / pageWidth)
        });
      }
    }
  }

  newMenuSelected(index) {
    // console.log("newMenuSelected", index)
    this.setState({ selectedPage: index });
    // if(this._CollapsibleScrollViewRef){
    //     this._CollapsibleScrollViewRef.scrollToHeaderTop();
    // }
  }

  onMenuSelect(index) {
    this.scrollToPage(index, this.state.containerWidth, false);
    this.newMenuSelected(index);
  }

  scrollToPage(indexPage, containerWidth, animated) {
    const moveToX = indexPage * containerWidth;
    if (this._horizontalScrollView) {
      try {
        this._horizontalScrollView.scrollTo({ x: moveToX, animated });
        if (!this.state.scrolledToInitalPage) {
          setTimeout(() => {
            this.setState({ scrolledToInitalPage: true });
          }, 50);
        }
      } catch (err) {
        // console.log("_horizontalScrollView.scrollTo error", err)
      }
      if (!animated) {
        this.state.pageScrollX.setValue(moveToX);
      }
    }
  }

  renderIcon({ item, index, tintColor }) {
    return (
      <View style={styles.menuButton}>
        <View style={styles.menuButtonTitleContainer}>
          <StyledText
            adjustsFontSizeToFit
            style={[styles.menuButtonTitle, { color: tintColor }]}
          >
            {item.title.toUpperCase()}
          </StyledText>
          {(item.badgeValue || item.badgeValue > 0) && (
            <View style={styles.badge}>
              <StyledText style={styles.badgeNumber}>
                {item.badgeValue}
              </StyledText>
            </View>
          )}
        </View>
      </View>
    );
  }

  renderPages() {
    // console.log("render CollapsibleMenuTabScenes")
    const children = Array.isArray(this.props.children)
      ? this.props.children
      : [this.props.children];

    return children.map((child, index) => {
      let headerTranslate = null;
      if (this.state.selectedPage === index) {
        headerTranslate = this.state.headerTranslate;
      }
      return (
        <ScrollPage //vertical page scrolls
          key={index}
          pageIndex={index}
          currentlySelectedPageIndex={this.state.selectedPage}
          lazyLoad={this.props.lazyLoad}
          onMomentumScrollEnd={this.onPageScrollEnd}
          onScrollEndDrag={this.onPageScrollEnd}
          headerTranslate={headerTranslate}
          headerDistance={this.state.headerDistance}
          maxHeaderHeight={this.state.maxHeaderHeight}
          pageWidth={this.state.containerWidth}
          ref={instance => {
            if (instance !== null) {
              this.references[index] = instance;
            }
          }}
          minPageHeight={this._minPageHeight}
          // sceneLoaded = {this.state.scrolledToInitalPage}
          sceneLoaded={true}
          scrollEnabled={!this.state.movingHorizontally}
        >
          {child}
        </ScrollPage>
      );
    });
  }

  render() {
    // console.log("RENDER TEST SCROLL")
    const headerHeightStyle =
      this.props.maxHeaderHeight > 0
        ? { height: this.props.maxHeaderHeight }
        : {};

    let translateHeader = 0;
    if (this.state.headerDistance > 0 && !this.props.headerFixed) {
      translateHeader = this.state.headerTranslate.interpolate({
        inputRange: [0, this.state.headerDistance],
        outputRange: [0, -this.state.headerDistance],
        extrapolate: "clamp"
      });
    }

    let titles = [];
    if (Array.isArray(this.props.children)) {
      titles = this.props.children.map(child => {
        return {
          title: child.props.title,
          badgeValue: child.props.badgeValue ? child.props.badgeValue : 0
        };
      });
    } else {
      titles.push({
        title: this.props.children.props.title,
        badgeValue: this.props.children.props.badgeValue
          ? this.props.children.props.badgeValue
          : 0
      });
    }

    const menuProps = {
      items: titles,
      activeTintColor: this.props.activeTintColor,
      inactiveTintColor: this.props.inactiveTintColor,
      bottomIndicatorColor: this.props.bottomIndicatorColor,
      onMenuSelect: this.onMenuSelect,
      menuWidth: this.state.containerWidth,
      selectedMenuIndex: this.state.selectedPage,
      pageScrollX: this.state.pageScrollX,
      sceneLoaded: this.state.scrolledToInitalPage
    };

    return (
      <View style={styles.container} onLayout={this.setContainerLayout}>
        <Animated.ScrollView //horizontal scroll
          keyboardShouldPersistTaps="handled"
          horizontal={true}
          pagingEnabled={true}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          overScrollMode="never"
          onMomentumScrollEnd={this.onScrolledToPage}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.state.pageScrollX } } }],
            { listener: this.trackScrollPosition, useNativeDriver: true }
          )}
          ref={instance => {
            if (instance !== null) {
              this._horizontalScrollView = instance._component;
            }
          }}
        >
          {this.renderPages()}
        </Animated.ScrollView>
        <Animated.View //header
          onLayout={this.setHeaderLayout}
          style={[
            styles.headerStyle,
            headerHeightStyle,
            { transform: [{ translateY: translateHeader }] }
          ]}
        >
          {this.props.headerComponent && this.props.headerComponent}
          <MenuTabPanel {...menuProps} iconComponent={this.renderIcon} />
        </Animated.View>
      </View>
    );
  }
}

const propTypes = {
  maxHeaderHeight: PropTypes.number,
  stickyHeaderHeight: PropTypes.number,
  headerFixed: PropTypes.bool,
  initialPage: PropTypes.number,
  activeTintColor: PropTypes.string,
  inactiveTintColor: PropTypes.string,
  bottomIndicatorColor: PropTypes.string,
  lazyLoad: PropTypes.bool,
  pageWidth: PropTypes.number,
  pageHeight: PropTypes.number
};

const defaultProps = {
  maxHeaderHeight: 0,
  stickyHeaderHeight: 0,
  headerFixed: false,
  initialPage: 0,
  lazyLoad: true,
  pageWidth: 0,
  pageHeight: 0
};

CollapsibleMenuTabScenes.propTypes = propTypes;
CollapsibleMenuTabScenes.defaultProps = defaultProps;

export { CollapsibleMenuTabScenes };
