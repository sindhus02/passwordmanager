import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import LoginPage from '../components/LoginPage';
import { ListItem , Button, Icon, Input } from 'react-native-elements';
import AuthHelper from '../services/AuthHelper';
import HttpHelper from '../services/HttpHelper';
import BottomSheet from "react-native-raw-bottom-sheet";
import { FloatingAction } from 'react-native-floating-action';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props){
    super(props)
    this.http = new HttpHelper()
    this.auth = new AuthHelper()

    this.state = {
      accounts: [],
      addAccountString: '',
      addPasswordString: '',
      token: null
    }

    this.props.navigation.addListener(
      'willFocus',
      async payload => {
        this.setState({token: await this.auth.getToken()}, () => {
          this.getAccounts()
        })
      }
    );

  }

  getAccounts(){
    const url = '/accounts'
  
    this.http.get({url, headers: {'x-access-token': this.state.token}})
      .then(response => this.setState({accounts: response.accounts || []}))
  }

  getPasswordForAccount(account){
        
    const url = '/account/' + account
    
    this.http.get({url, headers: {'x-access-token': this.state.token}})
      .then(response => {
        this.accountInfo = response
        this.sheet.open()
      })
  }

  showPassword(){
    Alert.alert(
      'Password for ' + this.accountInfo.account,
      this.accountInfo.password,
      [
        {text: 'Copy', onPress: () => {Clipboard.setString(this.accountInfo.password)}},
      ],
      {cancelable: true},
    )
  }

  deleteAccount(){
    Alert.alert(
      'Delete',
      'Are you sure that you want to delete ' + this.accountInfo.account + '?',
      [
        {text: 'Yes', onPress: () => {
          const url = '/account/' + this.accountInfo.account + '/delete'
        
          this.http.delete({url, headers: {'x-access-token': this.state.token}})
            .then(response => {
              this.sheet.close()
              this.getAccounts()
            })
        }},
        {text: 'Cancel', onPress: () => null},
      ],
      {cancelable: true},
    )
  }

  addAccount(account, password){
    if(account == '' || password == ''){
      alert('Missing fields')
      return
    }

    const url = '/account'
  
    this.http.post({url, headers: {'x-access-token': this.state.token, account, password}})
      .then(response => {
        this.addSheet.close()
        this.getAccounts()
      })
  }

  render() {

    if(this.state.token == null){
      return(
        <View style={styles.container}>
          <LoginPage refresh={token => this.setState({token}, () => this.getAccounts())}/>
        </View>
      )
    }
    
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={{fontSize: 32, fontWeight: 'bold', color: 'white'}}>Password Manager</Text>
          <Text style={{fontSize: 12, fontStyle: 'italic', color: 'white'}}>Made with Express.js, MongoDB and React Native</Text>
        </View>
        {
          this.state.accounts !== null && this.state.accounts.length == 0?
          <Text style={{textAlign: 'center', marginTop: 10}}>No Accounts Saved</Text>: null
        }
        <View style={{flex: 3}}>
          {
            this.state.accounts.map((l, i) => (
              <ListItem
                key={i}
                title={l}
                rightIcon={{name: 'chevron-right'}}
                bottomDivider
                onPress={() => this.getPasswordForAccount(l)}
              />
            ))
          }
        </View>
        <BottomSheet
          ref={ref => {
            this.sheet = ref;
          }}
          height={200}
          duration={250}
          customStyles={{
            container: {
              justifyContent: "center",
              alignItems: "center"
            }
          }}
        >
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          <Button 
            title="Show Password"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.showPassword()}
          />
          <Button 
            title="Delete"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.deleteAccount()}
          />
        </View>
        </BottomSheet>
        <BottomSheet
          ref={ref => {
            this.addSheet = ref;
          }}
          onClose={() => this.setState({addAccountString: '', addPasswordString: ''})}
          height={300}
          duration={250}
          customStyles={{
            container: {
              justifyContent: "center",
              alignItems: "center"
            }
          }}
        >
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          <Input
            inputContainerStyle={{width: 250, height: 50}}
            placeholder='www.website.com'
            onChangeText={(addAccountString) => this.setState({addAccountString})}
          />
          <Input
            inputContainerStyle={{width: 250, height: 50}}
            placeholder='password'
            secureTextEntry
            onChangeText={(addPasswordString) => this.setState({addPasswordString})}
          />
          <Button 
            title="Add Account"
            type="outline"
            buttonStyle={{width: 250}}
            onPress={() => this.addAccount(this.state.addAccountString, this.state.addPasswordString)}
          />
        </View>
        </BottomSheet>
        <FloatingAction 
          ref={(ref) => { this.floatingAction = ref; }}
          overlayColor={'rgba(0, 0, 0, 0.0)'}
          onPressMain={() => this.addSheet.open()}
          floatingIcon={
            <Icon name='add' color='white'/>
          }
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4286f4',
  }
});
