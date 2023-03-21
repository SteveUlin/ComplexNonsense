---
title: How to Serve a Global Website Quickly?
date: 2023-02-22
tldr:
  In this article, I provide an overview of Content Delivery Networks (CDNs).
  To demonstrate how a CDN works, I build a simple static website and deploy it
  to AWS S3 / CloudFront using AWS Amplify.
---

## How do you serve websites globally with low latency?

To answer the above question, we first need to talk a bit about how networking
works and why some website might be slow to load slow.

### How does the internet work? (DNS)

When trying to connect to 'google.com', your computer needs to first convert the
domain name to an IP address like '142.251.32.46'. These mapping are stored in a
[DNS](https://en.wikipedia.org/wiki/Domain_Name_System) servers. The DNS servers
are globally distributed and owned by a number of different companies.
The closer you are to a DNS server, the faster the lookup will be.

We can check the time it takes to resolve the IP address of 'google.com' using
the DNS lookup utility `dig`.

```shell
$ dig @1.1.1.1 google.com                               (base) 

; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> @1.1.1.1 google.com
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 1576
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;google.com.                    IN      A

;; ANSWER SECTION:
google.com.             74      IN      A       142.251.32.46

;; Query time: 11 msec
;; SERVER: 1.1.1.1#53(1.1.1.1) (UDP)
;; WHEN: Mon Mar 20 15:04:05 PDT 2023
;; MSG SIZE  rcvd: 55
```

At the bottom we can see that it took 11 milliseconds to resolve the IP address.
This is so incredibly slow 🙃 that there are 3 separate caches that try to
circumvent the DNS lookup. First your browser will cache the IP address. If that
lookup fails, your operating system also has a cache. Finally, if operating
system lookup fails, your router also caches the IP address mapping.

### How does the internet work? (Routing)

Now that we have an IP address, we need to connect to the "computer" that is
associated with the IP. As a gross generalization, the internet is just a bunch
of routers passing packets around. Hopefully the packet will get closer to its
destination which each pass. This pass of a packet from router to router is
called a hop. Generally, the more hops it takes to get to a destination, the
slower the connection will be.

We can check the number of hops it takes to get to google.com using the
`traceroute` command.

```shell
$ traceroute to google.com (172.217.16.238), 30 hops max, 60 byte packets
 1  ec2-52-56-0-21.eu-west-2.compute.amazonaws.com (52.56.0.21)  3.038 ms
 2  *
 3  *
 4  100.66.10.44 (100.66.10.44)  2.064 ms
 5  100.66.6.43 (100.66.6.43)  5.377 ms
 6  100.66.4.159 (100.66.4.159)  30.440 ms
 7  100.65.10.33 (100.65.10.33)  4.570 ms
 8  15.230.158.147 (15.230.158.147)  6.952 ms
 9  15.230.158.158 (15.230.158.158)  1.555 ms
10  52.95.61.53 (52.95.61.53)  1.083 ms
11  100.91.49.89 (100.91.49.89)  17.037 ms
12  52.93.0.154 (52.93.0.154)  8.484 ms
13  52.93.113.7 (52.93.113.7)  11.952 ms
14  74.125.118.66 (74.125.118.66)  10.516 ms
15  *
16  108.170.241.161 (108.170.241.161)  8.338 ms
17  108.170.241.204 (108.170.241.204)  9.824 ms
18  108.170.237.171 (108.170.237.171)  10.015 ms
19  142.251.233.251 (142.251.233.251)  8.878 ms
20  142.251.232.223 (142.251.232.223)  8.728 ms
21  74.125.242.65 (74.125.242.65)  8.113 ms
22  142.251.52.149 (142.251.52.149)  8.527 ms
23  lhr48s28-in-f14.1e100.net (172.217.16.238)  8.495 ms
```

It takes a total of 23 hops to get to google.com from my EC2 instance in London.

### Decreasing latency (CDNs)

If you live in Singapore and are trying to connect to a website that is hosted
in the US, there will be a lot of hops. These hops cause excessive latency.

To solve this problem, companies started setting up small datacenters around the
world. These datacenters are called Points of Presence of a [Content Delivery
Network](https://en.wikipedia.org/wiki/Content_delivery_network) or CDN.

Instead of serving data from one location, a CDN will serve data from a
hopefully closer Point of Presence, reducing latency.

The storage space in these Points of Presence is valuable. So instead
of storing data indefinitely at these Points of Presence, CDN usually
only cache content. The result being, as traffic volume increase you
will see a decrease in latency.

#### Wait, how does my computer find the closest Point of Presence?

This is all well and good, but how does my computer know which Point of Presence
to connect to? There are two main strategies for routing traffic to a
CDN's Point of Presence: DNS trickery and Anycast.

- DNS trickery

  The first strategy is to use DNS to route traffic to the closest Point of
  Presence.  You network provider already routes DNS traffic to the closest DNS
  server. So based on the geolocation of the DNS server, CDNs will list different
  IP addresses for the same domain. This routes traffic to the closest Point of
  Presence.

- Anycast

  There are 4 main ways of sending information across a network: Unicast, Multicast,
  Broadcast, and Anycast.

  - Unicast: Send information to a single destination. This is the most common way
    of sending information.
  - Multicast: Send information to multiple destinations. This is useful for
    sending information to a group of computers.
  - Broadcast: Send information to all destinations that opt in. This is useful
    for sending information to all computers on a network.
  - Anycast: Send information to the closest destination. This is useful for
    sending information to the closest computer.

  With Anycast each Point of Presence will have the same IP address. When a
  computer tries to connect to a Point of Presence, the computer will automatically
  connect to the closest Point of Presence.

## Implementation

The goal of this project is to create a static website that is hosted on AWS and
serve this content from a CDN.

The following goes over some of the steps I took to implement this website. You
can view the code on github https://github.com/SteveUlin/ComplexNonsense.

### Static Site Generation
There are a lot of [static site generators](https://jamstack.org/generators/).
[Eleventy](https://www.11ty.dev) distinguishes itself by:

- having an active user base
- being actively developed
- being a node package

As Eleventy is a node package, I can manage my entire website through
[npm](https://www.npmjs.com/).

### CSS

[Tailwindcss](https://tailwindcss.com/) makes playing with CSS easy. It provides
reasonable defaults while being flexible enough to make more or less any UI. As
someone without much font end development experience, this is a wonderful tool.

### Hosting

[AWS Amplify](https://aws.amazon.com/amplify/) builds out the dev ops for static
site hosing. All you need to do is point it at your git repository and it will
build and host your site.

We can check that this site is being served by AWS's CDN by using
pinging on a couple of different EC2 Locations and seeing different servers.

```shell
$ ping complexnonsense.com
PING complexnonsense.com (18.244.179.100) 56(84) bytes of data.
64 bytes from server-18-244-179-100.lhr61.r.cloudfront.net (18.244.179.100): icmp_seq=1 ttl=241 time=1.11 ms
64 bytes from server-18-244-179-100.lhr61.r.cloudfront.net (18.244.179.100): icmp_seq=2 ttl=241 time=1.09 ms
64 bytes from server-18-244-179-100.lhr61.r.cloudfront.net (18.244.179.100): icmp_seq=3 ttl=241 time=1.09 ms
```

```shell
$ ping complexnonsense.com
PING complexnonsense.com (99.84.66.82) 56(84) bytes of data.
64 bytes from server-99-84-66-82.hio50.r.cloudfront.net (99.84.66.82): icmp_seq=1 ttl=228 time=4.94 ms
64 bytes from server-99-84-66-82.hio50.r.cloudfront.net (99.84.66.82): icmp_seq=2 ttl=228 time=4.96 ms
64 bytes from server-99-84-66-82.hio50.r.cloudfront.net (99.84.66.82): icmp_seq=3 ttl=228 time=5.06 ms
```

## Conclusion

I am happy with the format of this post, not only solving System Design
problems but also implementing a solution. I hope to continue this format
in the future.

Thanks for reading!

## References

- [Byte Byte Go](https://bytebytego.com/)
- [Wikipedia](https://en.wikipedia.org/wiki/Content_delivery_network)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Eleventy](https://www.11ty.dev)
- [Tailwindcss](https://tailwindcss.com/)
- [Load Balancing Without Load Balancers](https://blog.cloudflare.com/cloudflares-architecture-eliminating-single-p/)