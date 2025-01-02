# Password Manager
Make remebering your countless password easy and secure with this simple password manager mobile app
 
### Tech Stack
This application's backend was built with Express.js and MongoDB. The mobile app was made using React Native. The combination of these technologies allowed for fast development. 

### Security
Nowadays, your passwords are protecting your most valuable things. Therefore, a password manager must put security ahead of everything. To accomplish this, we use AES256 encryption to securely encrypt your valuable passwords. This is done by randomly generate a 32-character key at sign up, this key is then used to encrypt your passwords. However, we don't store this key as plain text, we use your `master password`, that we also don't store, to encrypt it. This means that you're that only person that can decrypt and see your passwords. 
