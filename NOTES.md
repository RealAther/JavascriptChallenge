# Ports

Numbers from 0 to 2^16-1 aka 65535. Each number can only be used at one time by one program on each port. Different programs can listen on same port across different IPs.
For one program to listen on a port, previous program must release theirs if they are the same.

# TCP vs UDP
TCP = Data transmission protocol that retries things if they fail. Also makes sure that data reaches in the same order on the other side. For example, if you send a 12 GB file, it will be split into 50 or whatever KB of packets. Each packet would be sent individually and in case of a network issue only that much KB of data will be lost and would require retransmission. The receiver then combines all of the packets when they have them all into a single chunk of data.

UDP = Data transmission protocol that's fire and forget. This is only used for things that are no longer useful if they are late or out of order. The most common use case for this is audio and video. You do not want to hear audio from half a minute ago. If it's not realtime and in order, it's useless.

There are several jokes about UDP packets, for example: UDP packet walks a bar into. Mainly because UDP doesn't care what order packets arrive in.

--

Regardless of the port. Whenever data is transmitted, it's a string, can be binary but a string still.

# HTTP v1.1
Hyper text transmission protocol blah blah blah. This is built on top of the TCP because it requires things to be on order and in full length at the receiving end.
HTTP protocol has different "parameters" that allow the client to perform various actions. It has a "path", "headers" and a "method" to ensure proper identification and communication between server and client.
The path is the URL you are visiting in a browser, headers contains details like your identification cookies, your browser agent name/version so website can serve a website experience specific to yours (if they want to) and then a method that allows you to GET/POST/HEAD/PATCH/DELETE among others on the same path.
Because TCP is a text protocol, here's what an HTTP v1.1 request roughly looks like

GET /index.html

Cookies: some=thing&another=thing
Accepts: text/html;text/x-html&whatever


Here's what a POST request roughly looks like

POST /index.html

Cookies: some=thing&another=thing
Accepts: application/json;
Content-Type: application/x-www-form-urlencoded

some=thing&another=yolo

The last line of this request is very important. It is serialized in a form encoding. Because servers support multiple encodings at the same time we send a `Content-Type` header to make it easier for the server to properly and accurate decode the post content given. Because the post data can contain objects and more, this content type is used to "encode" and "decode" data while communicating with the server.
