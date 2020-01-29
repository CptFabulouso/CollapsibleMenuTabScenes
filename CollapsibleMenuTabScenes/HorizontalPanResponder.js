import React, {Component} from "react"
import { View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager, Easing, Platform } from "react-native"
import styles from "./styles/HorizontalPanResponderStyle"

const SCREEN_WIDTH = Dimensions.get("window").width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_SPEED_THRESHOLD = 0.7;
const SWIPE_OUT_DURATION = 250;
const DX_CAPTURE_THRESHOLD = 10;
const DY_CAPTURE_THRESHOLD = Platform.OS === "ios"? 8 : 7;


class HorizontalPanResponder extends Component{
	
	static defaultProps = {
		onSwipeRight: () => {},
		onSwipeLeft: () => {}
	}

	constructor(props){
		super(props)

		this.state = {
			moving: false,
		}

		const position = new Animated.Value(0);
		const pageTranslate = new Animated.Value(1000)
		// const panResponder = PanResponder.create({
		// 	// onStartShouldSetPanResponder: () => true,
		// 	onMoveShouldSetPanResponderCapture: (evt, gesture) => {
		// 		// console.log("onMoveShouldSetPanResponderCapture", gesture.dx, gesture.dy)
		// 		if(Math.abs(gesture.dx) > DX_CAPTURE_THRESHOLD &&  Math.abs(gesture.dy) < DY_CAPTURE_THRESHOLD){
		// 			console.log("SET RESPONDER")
		// 			if(!this.props.movingHorizontally){
		// 				this.props.onHorizontalMoveChange(true)
		// 			}
		// 			pageTranslate.setValue(100)
		// 			// this.setState({moving: true})
		// 			return true
		// 		}
		// 		return false;
		// 	},
		// 	// onPanResponderMove: Animated.event([
		// 	//    null,                // raw event arg ignored
		// 	//    {dx: this.position},    // gestureState arg
		// 	//  ]),
		// 	onPanResponderMove: (event, gesture) => {
		// 		// console.log("onPanResponderMove", gesture.dx);
		// 		position.setValue(gesture.dx)
		// 	},
		// 	onPanResponderTerminate: (event, gesture) => {
		// 		this.onSwipeRelease(gesture)
		// 	},
		// 	onPanResponderRelease: (event, gesture) => {
		// 		this.onSwipeRelease(gesture)
		// 	},
		// 	onShouldBlockNativeResponder: () => {
		// 		console.log("onShouldBlockNativeResponder")
		// 		return false
		// 	},
		// });

		this.position = position;
		// this.panResponder = panResponder;
		this.pageTranslate = pageTranslate
	}

	// componentWillReceiveProps(nextProps) {
	// 	if(nextProps.data !== this.props.data){
	// 		//reset stack to 0
	// 		this.setState({ index:0 })
	// 	}
	// }

	// componentWillUpdate(nextProps, nextState) {
	// 	UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);	
	// 	LayoutAnimation.spring();
	// }

	resetPosition(){
		Animated.timing(this.position, {
			toValue: 0,
			useNativeDriver: true,
			duration: 200,
			easing: Easing.out(Easing.quad),
		}).start(() =>{
			if(this.props.movingHorizontally){
				this.props.onHorizontalMoveChange(false)
			}
			// this.setState({moving: false})
		})
	}

	forceSwipe(direction){
		Animated.timing(this.position, {
			toValue: direction * this.props.pageWidth,
			duration: SWIPE_OUT_DURATION,
			useNativeDriver: true,
			easing: Easing.out(Easing.quad),
		}).start(() => this.onSwipeComplete(direction))
	}

	onSwipeRelease(gesture){
		console.log("onPanResponderMove", gesture, gesture.vx);
		if(gesture.dx > SWIPE_THRESHOLD 
			// || gesture.vx > SWIPE_SPEED_THRESHOLD
			){
			this.forceSwipe(1);
		} else if (gesture.dx < -SWIPE_THRESHOLD
		 // || gesture.vx < -SWIPE_SPEED_THRESHOLD
		 ){
			this.forceSwipe(-1);
		} else {
			this.resetPosition();
		}
	}

	onSwipeComplete(direction) {
		this.position.setValue(0)
		this.props.onHorizontalMoveChange(false)
		this.props.onPageChange(this.props.currentPage - direction)
	// 	const { onSwipeLeft, onSwipeRight, data } = this.props;
	// 	const item = data[this.state.index]

	// 	direction === 1 ? onSwipeRight(item) : onSwipeLeft(item);

	// 	//prepare next card
	// 	this.position.setValue({ x:0, y:0 })
	// 	this.setState({ index: this.state.index +1 })
	}

	// getCardsStyle(){
	// 	const position = this.position;
	// 	const rotate = position.x.interpolate({
	// 		inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
	// 		outputRange: ["-120deg", "0deg", "120deg"]
	// 	});

	// 	return {
	// 		// ...this.position.getLayout(),
	// 		transform: [
	// 		...this.position.getTranslateTransform(),
	// 			{ rotate },
	// 		]
	// 	}
	// }

	// renderCards() {
	// 	const { index } = this.state

	// 	if(index >= this.props.data.length){
	// 		return this.props.renderNoMoreCards()
	// 	}
	// 	return this.props.data.map((item, i) => {
	// 		if(i < index){
	// 			return null;
	// 		}
	// 		if (i === index) {
	// 			return (
	// 				<Animated.View 
	// 					key = {item.id}
	// 					style = {[this.getCardsStyle(), styles.cardStyle]}
	// 					{...this.panResponder.panHandlers}
	// 				>
	// 					{this.props.renderCard(item)}
	// 				</Animated.View>
	// 			)
	// 		}


	// 		return (
	// 			<Animated.View 
	// 				key = {item.id}
	// 				style = {[styles.cardStyle, { top: 10 * (i - this.state.index)}]}
	// 			>
	// 				{this.props.renderCard(item)}
	// 			</Animated.View>
	// 		)
	// 	}).reverse()
	// }

	renderPage(page){

	}

	renderPages(){
		return this.props.children.map((child, index) => {
			// return child;

			const distance = index - this.props.currentPage
			const translateX = this.props.movingHorizontally ? this.props.pageWidth : 1000
			// const translateX = this.props.pageWidth
			let pageStyle = {};
			if(distance === -1){
				pageStyle = {
					position: "absolute", 
					width: this.props.pageWidth, 
					right: translateX
				} 
			} else if(distance === 0 ){
				return <Animated.View 
					style = {[pageStyle, {
						flex:1, 
						transform: [
							{translateX: this.position}
						]
					}]}
					key = {index}
					// {...this.panResponder.panHandlers}
				>
				{child}
				</Animated.View>
			} else if(distance === 1){
				pageStyle = {
					position: "absolute", 
					width: this.props.pageWidth, 
					left: translateX,
				} 
			} else {
				return null
			}
    		return (
				<Animated.View 
					style = {[pageStyle, {
						flex:1, 
						transform: [
							{translateX: this.position}
						]
					}]}
					key = {index}
				>
				{child}
				</Animated.View>
			)
    	})
	}

	render(){
		console.log("children", this.props)
		// return(
		// 	<View>
		// 		{this.renderPages()}
		// 	</View>
		// 	)
		return(
			<View style = {{
				flex:1, 
				flexDirection: "row",
				}} 
			>
				{
					this.renderPages()
					// this.props.children
				}
			</View>
		)
	}

}

export default HorizontalPanResponder
