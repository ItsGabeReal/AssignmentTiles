import { Component } from 'react';
import { View, PanResponder } from 'react-native';

export default class DraggableComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            x: 0,
            y: 0,
        };

        this.panResponder = PanResponder.create({
            onPanResponderGrant: (evt, gestureState) => {
                this.state = {
                    x: gestureState.x0,
                    y: gestureState.y0,
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                this.state = {
                    x: gestureState.dx + this.state.x,
                    y: gestureState.dy + this.state.y,
                };
            },
        })
    }

    render() {
        return (
            <View
                style={{
                    position: 'absolute',
                    left: this.state.x,
                    top: this.state.y,
                    backgroundColor: 'blue',
                    width: 50,
                    height: 50,
                }}
                {...this.panResponder.panHandlers}
            />
        );
    }
}