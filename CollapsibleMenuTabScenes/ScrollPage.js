import React, { Component } from 'react';
import {
	View,
  	Text,
  	ScrollView,
  	Animated,
  	Platform,
  	ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { StyledText } from "../StyledText"
import { Spinner } from "../Spinner"
import { Fonts, Metrics, Colors } from "../../themes"
import styles from "./styles/ScrollPageStyle"

const AnimatedScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);

class ScrollPage extends Component {

	constructor(props){
		super(props)

        this._scrolRef = null;
        this.contentAnim = new Animated.Value(0)
	}

	scrollToPosition(yOffset, animated){
		if(yOffset < this.props.headerDistance){
			// this._scrolRef.scrollTo({ y: yOffset, animated });
			this._scrolRef.scrollToPosition(0, yOffset, animated);
		} else {
			// this._scrolRef.scrollTo({ y: this.props.headerDistance, animated });
			this._scrolRef.scrollToPosition(0, this.props.headerDistance, animated);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if(this.props.pageWidth !== nextProps.pageWidth){
			return true;
		}
		if(nextProps.lazyLoad && nextProps.pageIndex !== nextProps.currentlySelectedPageIndex){
			//pozdrž rerender ostatních stránek
			setTimeout(() => {
				return true;
            }, 200)
		}
		return true;
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.sceneLoaded !== nextProps.sceneLoaded && nextProps.sceneLoaded){
			this.showContent()
		}
	}

	showContent(){
		Animated.timing(
			this.contentAnim, {
				toValue: 1,
				duration: 500
			}
		).start()
	}

	renderPageContent(){
		const { sceneLoaded, pageIndex, currentlySelectedPageIndex, lazyLoad } = this.props;
		
		if(sceneLoaded){
			// if(lazyLoad && pageIndex === currentlySelectedPageIndex){
	        	return this.props.children
			// }
		} 
	}

    render(){
    	const MAX_PAGE_WIDTH = Metrics.maxPageWidth;
    	const paddingHorizontal = this.props.pageWidth > MAX_PAGE_WIDTH ? ((this.props.pageWidth - MAX_PAGE_WIDTH)/2) : 0
        const additionalPageStyle = {
        	width: this.props.pageWidth, 
        	minHeight: this.props.minPageHeight, 
        	paddingHorizontal
        }

        // console.log("this.props.children", this.props.children)

    	return (
    		<AnimatedScrollView
	        	bounces = {false}
	   			scrollEventThrottle = {16}
	        	contentContainerStyle={{paddingTop: this.props.maxHeaderHeight}}
				keyboardShouldPersistTaps = "handled"
		        extraHeight={Platform.OS === "ios"? 100 : 180} 
	        	onScroll = {Animated.event(
					[{nativeEvent: {contentOffset: {y: this.props.headerTranslate}}}],
					{ useNativeDriver: true },
	            )}
	            ref = {instance => {
                    if(instance !== null){
                    	this._scrolRef = instance._component;
                    }
                }}
                {...this.props}
	        >
	        	<View style = {[styles.pageContainer, additionalPageStyle]} >
	        		{this.renderPageContent()}
	        	</View>
	        </AnimatedScrollView>
    	)
    }

}

const propTypes = {
	children: PropTypes.element.isRequired
}

const defaultProps = {
};

ScrollPage.propTypes = propTypes;
ScrollPage.defaultProps = defaultProps;

export default ScrollPage