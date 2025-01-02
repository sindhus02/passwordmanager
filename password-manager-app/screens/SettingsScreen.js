import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoginPage from '../components/LoginPage';
import CreateAccountPage from '../components/CreateAccountPage';
import AuthHelper from '../services/AuthHelper';
import HttpHelper from '../services/HttpHelper';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props)

    this.state = {
      token: null,
      user: null,
      showCreateAccount: false
    } 

    this.auth = new AuthHelper()

    this.props.navigation.addListener(
      'willFocus',
      async payload => {
        this.setState({token: await this.auth.getToken()}, () => this.getUserInfo())
      }
    );
  }

  getUserInfo(){
    if(this.state.token == null) return

    const http = new HttpHelper()
    const url = '/user/'
    const headers = {'x-access-token': this.state.token}
    http.get({url, headers})
      .then(response => this.setState({user: response.user}))

  }

  renderProfile(){
    if(this.state.user == null) return <View />
    return(
      <View style={styles.container}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>{this.state.user.name}</Text>
        <Text style={{fontSize: 13}}>{this.state.user.email}</Text>
        <TouchableOpacity style={{marginTop: 30}} onPress={() => this.auth.logout().then(() => this.setState({token: null}))}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    if(this.state.showCreateAccount){
      return(
        <View style={{flex: 1}}>
          <CreateAccountPage showLogin={() => this.setState({showCreateAccount: false})} onComplete={(token) => {
            this.setState({showCreateAccount: false, token}, () => this.getUserInfo())
          }}/>
        </View>
      )
    }
    return (
      <View style={{flex: 1}}>
        {
          this.state.token == null?
            <LoginPage refresh={token => this.setState({token}, () => this.getUserInfo())} showAccountCreation={() => this.setState({showCreateAccount: true})}/>:
            this.renderProfile()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
});

