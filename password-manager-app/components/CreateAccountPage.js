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
import HttpHelper from '../services/HttpHelper';

export default class CreateAccountPage extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',

    }

    createAccount(name, email, password, confirmPassword){
        if(password !== confirmPassword){
            alert('Passwords did not match')
            return
        }

        const http = new HttpHelper()
        const url = '/user'
        const body = {
            name,
            email,
            password,
            questions: {
                "What was your childhood nickname?": "answer-1",
                "What street did you live on in third grade?": "answer-2",
                "In what city or town was your first job?": "answer-3"
            }
        }
        headers = {"Content-Type": "application/json",}

        http.post({url, body, headers})
            .then(response => {
                if(response.status == 200){
                    alert('Your account has been created')
                    let auth = new AuthHelper()
                    auth.setAuth(response.token, response.id)
                    this.props.onComplete(response.token)
                } else {
                    alert(response.message)
                }
            })
            .catch(e => console.log(e))
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={{fontSize: 32, fontWeight: 'bold', color: 'white'}}>Password Manager</Text>
                    <Text style={{fontSize: 12, fontStyle: 'italic', color: 'white'}}>Create an Account</Text>
                </View>
                <View style={styles.loginContainer}>
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 20}}
                        placeholder='name'
                        onChangeText={(name) => this.setState({name})}
                    />
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 20}}
                        placeholder='email'
                        onChangeText={(email) => this.setState({email})}
                    />
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 20}}
                        placeholder='password'
                        secureTextEntry
                        onChangeText={(password) => this.setState({password})}
                    />
                    <Input
                        inputContainerStyle={{width: '80%', height: 50, alignSelf: 'center'}}
                        containerStyle={{marginBottom: 100}}
                        placeholder='confirm password'
                        secureTextEntry
                        onChangeText={(confirmPassword) => this.setState({confirmPassword})}
                    />
                    <Button 
                        title="Create Your Account"
                        buttonStyle={{width: 250}}
                        onPress={() => this.createAccount(this.state.name, this.state.email, this.state.password, this.state.confirmPassword)}
                    />
                    <TouchableOpacity onPress={() => this.props.showLogin()}>
                        <Text style={{marginTop: 20}}>Already a user? Login</Text>
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