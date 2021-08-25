# hiter.js
## HTTP(S) benchmark tools

hiter.js is a simple tool to test http/s server performance.

Usage:
```shell
npx hiter
   Usage: fshar COMMAND [arguments]...
    
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
hiter -target https://wpdomain.com/search?q=*
```
note: you can use `*` in target url to replace it with random string

