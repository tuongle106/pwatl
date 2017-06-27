# [![OneToNine](https://github.com/tuongle106/pwatl/blob/master/app/images/touch/chrome-touch-icon-192x192.png)]

##OneToNine

#How To Play
Numbers from 1 to 9 (129) will appear in increasing order in the boxes randomly. To beat this game, you will need to remember the order and location of the numbers as they appear, then click on the boxes in the exact same order as they appeared! 
Keep in mind that for each round, you will only have 6 seconds to remember the details.

#Synchonize data online/offline
Board history will be stored in local when user signed out or have no internet connection, 
It will be synchronized automatically after user logged-in and has internet connection.

#Notification
At first time user logged-in with google account, their device or web browser will register a fcmToken that can be used to send notification later.
But how to push notification? As we did not use BE server so we just push notification manually by Postman.


#Thank you
Thank you Firebase, this is the first time I build an app that used firebase as backend server, we don't need to waste time for basic things as authenticate, cached authentication info, 
even awesome database completely real time...
Thank you that guys who are reading this stub, If you found any defeat (for sure that it have a lot :)), please create new issue to keep track, 
I will keep you posted later, or contact me at [fb/magicwall6](https://www.facebook.com/magicwall6).
Thank you

##Installation
Run command:
* `npm install`
* `gulp serve:dist`

## Started from
[Web Starter Kit](https://github.com/google/web-starter-kit/releases/latest)
