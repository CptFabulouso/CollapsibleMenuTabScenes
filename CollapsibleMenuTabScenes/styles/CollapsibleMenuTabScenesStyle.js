import { StyleSheet, Platform } from 'react-native'
import { Colors, Metrics, Fonts } from '../../../themes/'

export default StyleSheet.create({

	container:{
		flex:1, 
	},

	headerStyle:{
		position:"absolute",
        top: 0,
        left:0,
        right:0,
        ...Platform.select({
            android: {
                backgroundColor: "white",
                elevation: 2,
            },
        }),
	},

	menuButton:{
		flex:1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.menuTabColor,
	},

	menuButtonTitle:{
		fontSize: Fonts.size.medium,
		fontWeight: "500",
	},

	menuButtonTitleContainer:{
		paddingHorizontal: 5,
		paddingVertical: Platform.OS === "ios"? 12 : 10,
		overflow: "visible"
	},

	badge:{
		width: 18,
		height: 18,
		backgroundColor: Colors.primaryColor,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		top: 0,
		right: 0,
		overflow: "visible",
		zIndex:10,
		elevation: 10
	},

	badgeNumber:{
		fontSize: 10,
		color: "white",
		backgroundColor: "transparent",
	}
})
