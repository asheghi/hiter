# hiter.js
## HTTP(S) benchmark tools


with web and cli interfaces

Usage:
```shell
npx hiter
   Usage: hiter COMMAND [arguments]...
    
    Commands:
    web                             start the web server
       [-port 8080]                 listening port
       [-host 127.0.0.1]            address to bind       
       [-noAuth]                    disable basic authentication
       [-username]                  username for authentication
       [-password]                  password for authentication
       
    start                           start stress test
        -target url                 example https://hostname.xyz/search?q=*
       [-concurrent 8]              cuncurrent requests number
       [-method GET]                GET or SET          
       [-payload {"foo" : "bar"}]   
    

```

Example:
```shell
#take down a mem-cached laravel website  
hiter -target https://wpdomain.com/search?q=* -concurrent 1024

#start with web gui at port 1337
hiter web -port 1337 -host 0.0.0.0 -password s3curePass
```
note: you can use `*` in target url to replace it with a random string

