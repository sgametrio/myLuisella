# myLuisella

Read [this italian document](https://goo.gl/ANQWbo) to know more about myLuisella project.

TL;DR myLuisella is a restaurant handler app. It is composed of 3 main parts: kitchen app, waiter app and server one. They are written in HTML5, CSS and JS to be installable on Firefox OS devices or executable via web browser.

The following paragraph describes how to setup the entire environment.

### Step by step installation guide
This guide assumes you're using a Debian-like distribution (e.g., Raspbian). However, it should be easily adaptable for other Linux distributions.
- Install git

        sudo apt-get install git 

- Download wiringPi

        git clone git://git.drogon.net/wiringPi

- Edit wiringPiI2C.c

        nano wiringPi/wiringPi/wiringPiI2C.c
        
  Paste these lines at the end of the file
  
      int wiringPiI2CWriteBlock (int fd, int command, int data[], int n)
      {
        int i = 0;
        size_t quantity = n;
        union i2c_smbus_data block;
        // Limit data size.
        if (I2C_SMBUS_I2C_BLOCK_MAX < quantity)
          quantity = I2C_SMBUS_I2C_BLOCK_MAX;
        block.block[0] = quantity;
        for (; i < quantity; i++)
          block.block[i+1] = data[i];
        return i2c_smbus_access (fd, I2C_SMBUS_WRITE, command, I2C_SMBUS_I2C_BLOCK_DATA, &block) ;
      }
      
  and save.
- Edit wiringPiI2C.h

        nano wiringPi/wiringPi/wiringPiI2C.h
  
  Paste this line at the end of the ones beginning with `extern int ...`
  
        extern int wiringPiI2CWriteBlock     (int fd, int command, int data[], int n) ;
        
  and save.
- Build wiringPi

        cd wiringPi
        ./build

- Install python2 and tweepy

        sudo apt-get install python2.7 python-pip
        sudo pip install tweepy

- Download this repository

        git clone git@github.com:lucach/tweetmachine.git

- Build

        cd tweetmachine
        ./build

- Inside `download.py` change these values with your [Twitter Developers](https://dev.twitter.com) app keys:
  - CONSUMER_KEY
  - CONSUMER_SECRET
  - ACCESS_TOKEN
  - ACCESS_TOKEN_SECRET

- Inside `download.py` change the `HASHTAG` you want to follow. Here you can customize other parameters (such as the number of tweets retrieved each time and the name of the output file).

- Start `download.py` in background. The easiest (but not very flexible) way:

        ./download.py &

- Start `program` (which reads a file and sends data to the Flashmat matrices)

        ./program 1 output.txt
        
### Licensing
The project is licensed under APACHE v2.0 terms and agreements:
http://www.apache.org/licenses/LICENSE-2.0