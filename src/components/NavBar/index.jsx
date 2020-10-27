import React from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.less';

class NavBar extends React.Component {
    constructor(...props) {
        super(...props);
        this.state = {
            statusBarHeight: 0
        }
    }

    componentDidMount() {
        Taro.getSystemInfo({
            success: (result) => {
                this.setState({
                    statusBarHeight: result.statusBarHeight
                })
            }
        })
    }

    render() {
        return (
            <View className="wy-nav-bar" style={{ paddingTop: this.state.statusBarHeight + 'px', ...this.props.style }}>
                <View className="wy-nav-bar-content">
                    {
                        this.props.left
                    }
                </View>
            </View>
        )
    }
}

export default NavBar;
