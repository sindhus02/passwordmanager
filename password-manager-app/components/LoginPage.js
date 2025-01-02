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
import { Button, Icon, Input } from 'react-native-elements';
import AuthHelper from '../services/AuthHelper';

export default class LoginPage extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        email: '',
        password: '',
    }

    login(email, password){
        const auth = new AuthHelper()
        auth.login(email, password)
            .then(response => this.props.refresh(response.token))
            .catch(error => alert(error))
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={{fontSize: 32, fontWeight: 'bold', color: 'white'}}>Password Manager</Text>
                    <Text style={{fontSize: 12, fontStyle: 'italic', color: 'white'}}>Login</Text>
                </View>
                <View style={styles.loginContainer}>
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 20}}
                        placeholder='email'
                        onChangeText={(email) => this.setState({email})}
                    />
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 100}}
                        placeholder='password'
                        secureTextEntry
                        onChangeText={(password) => this.setState({password})}
                    />
                    <Button 
                        title="Login"
                        buttonStyle={{width: 250}}
                        onPress={() => this.login(this.state.email, this.state.password)}
                    />
                    <TouchableOpacity onPress={() => this.props.showAccountCreation()}>
                        <Text style={{marginTop: 20}}>Create an account</Text>
                    </TouchableOpacity>
                </View>
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
    },
    loginContainer: {
        flex: 3,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%'
    }
  });