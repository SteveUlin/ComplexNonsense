---
title: Making Your Website Blazingly Fast with Content Delivery Networks and AWS Amplify
title: How would you make a website blazingly fast!?
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

We can measure the time it takes to resolve the IP address of 'google.com' using
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

### Content Delivery Networks (CDNs)

A Content Delivery Network (CDN) is a system of distributed servers that deliver web content to users based on their geographic location. The main goal of a CDN is to serve content to users as quickly and efficiently as possible. By caching and serving content from servers closer to users, CDNs can significantly reduce latency and improve website performance

## AWS Amplify

[AWS Amplify](https://aws.amazon.com/amplify/) is a set of tools and services
that help you build, deploy, and host scalable and fast web applications. In
this example, we will create a simple static website (this website) and deploy
it to AWS S3 and the AWS CloudFront CDN using AWS Amplify.

You can view the code on github https://github.com/SteveUlin/ComplexNonsense.

### Static Site Generation with Eleventy

First we need a website to host. [Eleventy](https://www.11ty.dev) is a npm
package that generates static sites from templates. It is a great tool for
generating a static site from markdown files.

11ty has great documentation and a large community. I won't go into detail on
how to use it here, but their Getting Started guide is a great place to begin.
https://www.11ty.dev/docs/getting-started/

### Hosting

[AWS Amplify](https://aws.amazon.com/amplify/) builds out the dev ops for static
site hosing. All you need to do is point it at your git repository, and Amplify will
build and host your site.

There is a CLI that you can use to configure your site. But I found it easier
to just use the web interface. https://aws.amazon.com/amplify/getting-started/

Once the site is hosted, we can verify that this site is being served by AWS's
CDN by using pinging on a couple of different EC2 Locations and seeing different
servers.

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

In conclusion, Content Delivery Networks (CDNs) play a crucial role in improving
website performance by reducing latency and speeding up content delivery. AWS
Amplify makes it easy to deploy and host a static website on a CDN, ensuring
your content is quickly accessible to users around the world.

I am happy with the format of this post, not only solving System Design
problems but also implementing a solution. I hope to continue this format
in the future.

Thanks for reading!

## References

- [Byte Byte Go (System Design Books)](https://bytebytego.com/)
- [Wikipedia CDN](https://en.wikipedia.org/wiki/Content_delivery_network)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Eleventy](https://www.11ty.dev)
- [Tailwindcss](https://tailwindcss.com/)
- [Load Balancing Without Load Balancers](https://blog.cloudflare.com/cloudflares-architecture-eliminating-single-p/)
