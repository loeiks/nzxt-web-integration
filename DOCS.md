# Documentation of Project

In this paper I will try to explain what I have built, which type of problems I've fixed and how I fixed them and general talking about the code and techs used in this small single page full stack app.

---

Let's divide this paper into three different title;

- Backend
- Frontend
- DevOps

## Backend

On the backend of this project I went with `Go` because it's a language that I want to learn and use other than NodeJS, I didn't create any backend or actually any kind of thing with `Go` before so this was first time I was doing it. I got so much help from **ChatGPT 4o** and I can easily say that it's at least 5x better than Google's Gemini especially understand what I'm intended, what I was trying to explain/do. So ChatGPT 4o was really great about understand my needs and giving me actually working code or code that requires minimal fixes.

Most of the things in `main.go` file (single and only file of the backend) written by ChatGPT I just changed some details and read the code to understand what it's doing. Go's syntax is not bad I kinda liked it and probably I will love that language while building more stuff with it. Anyway let's take a look to our backend code and how it went;

### First Try (HTTP Server with Go)

My first plan was creating a HTTP server in Go to respond with CPU data when requested, and make calls each second with interval. I went with a basic HTTP server code that's written by ChatGPT and there was only one major problem which was I wasn't able to get the CPU data in Windows.

Oh yes btw in my first plan I was going to build backend to get CPU data of Windows PC (my personal desktop pc), right now it sounds too stupid but I don't remember why I started it in this way. Then after I read some articles, forum posts etc. I find out that it's not easy to get CPU temp and usage data on Windows without an external app running, at least wasn't possible in Go, it's probably possible with languages like C or C++ but I'm not sure about that too.

So it was a failure.

### Second Plan (HTTP Server with Go in S1)

> S1 is the name of my ubuntu-server based small HP desktop pc which is running 7/24 and already running some stuff in it like homeassistant with docker, some containers, minecraft server etc. Key point is S1 = Ubuntu Server.

After I understand that it's not possible to get CPU data in Windows I realized that I could just get the CPU data of S1 and handle PC (my personal desktop running W11 Pro) CPU data with NZXT's npm package. In this way I will be only building backend to get S1's data and get the PC's data in frontend.

It was easy to get CPU data in linux env when compared to windows (expected xd). And I've found a way to do it in few minutes with help of a Google search and ChatGPT. Here is the working version of how I (and ChatGPT) did it;

https://github.com/loeiks/nzxt-web-integration/blob/8de652e01bb9423714ac8dc8a7765f3565340962/backend/main.go

After some code reading and small coding (I mean only some changes to code written by AI) I understand that in Go we have default type safety which was a thing I knew before, and it's great in my opinion. And if I'm not wrong we use `:=` like in `Lua` which is funny looking thing for me 😁. Another thing is, I don't know if this is how Go works or if this is a choice but most of the stuff works like `async await`.

```go
func getCPUTemperature() (float64, error) {
	data, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
	if err != nil {
		return 0, err
	}

	tempStr := strings.TrimSpace(string(data))
	tempMilliCelsius, err := strconv.Atoi(tempStr)
	if err != nil {
		return 0, err
	}

	return float64(tempMilliCelsius) / 1000.0, nil
}
```

This is the `function` that makes it possible to get the CPU temp which was the hard part in Windows because it was possible to get usage but temps weren't provided. Anyway in Linux (Ubuntu) we can read a file in `/sys/class/thermal/thermal_zone0/temp` directory.

By the way what I meant by saying it looks like `async await` was the calls like `os.ReadFile` (btw ChatGPT went with a deprecated usage for ReadFile and then I fixed it, but probably it would work) it's similar to this:

```js
const { data, err } = await os.ReadFile("/sys/class/thermal/thermal_zone0/temp");
```

I mean the syntax is similar, but I don't know if everything written like this or it's just a choice, we can change this in JS and do it like this:

```js
os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
    .then(({ data, err }) => {
        // ...
    })
    .catch((error) => {
        //...
    });
```

I will check this out later on. Anyway.

After I built that working version of HTTP server I switched to frontend part of the project which ate most of my time because of charts that I was aiming for. But before I start talking about frontend let me explain how I finished backend and I will explain why I switched to `WebSocket` (because makes more sense xd).

### Last Plan of Backend (WebSocket Server with Go)

After I understand that it's not a really good idea to make HTTP calls each second within a React component I switched backend to WS server instead of a HTTP server. Which is another tech/tool that I didn't directly use but I've used under [`wix-realtime`](https://dev.wix.com/docs/sdk/frontend-modules/realtime/subscribe) APIs, and it's something I already know a bit.

> [I've built a web application in the past where you can watch videos with your friends at the same time.](https://devpost.com/software/watch-by-exweiv) That application was built with Wix and it was using `wix-realtime` APIs which uses WebSocket so working logic and usage was kinda same or at least similar. But as you might expect wix-realtime had features that's also realted with other Wix apps/techs such as filtering messages based on user id etc.

Since I don't know Go well and actually never built a WS server I went to my best friend (ChatGPT) and asked him that I need a WS server and guess what? He adjusted current code to convert it into a WS server with small BUGs that I've fixed later with forum reading.

Here is the working version which is the latest version;

https://github.com/loeiks/nzxt-web-integration/blob/711853fcbd0b5895769ffc25a91e1da25fd3e6a4/backend/main.go

## Frontend

Now let's talk about frontend, I wanted to keep React and don't mess with other frameworks like Vue or Angular because I already know React. Here is the frontend stack;

- TypeScript
- React
- Vite + SWC
- TailwindCSS
- Shadcn/UI
- Redux

For a single page basic application it's absolutely overkill but, our goal is learning new tools experimenting with these tools/languages while building something that we actually use and planned because it's one of the best way to learn things which is testing in a real scenario.

### Creating Charts with Shadcn/UI + Recharts

I was planning to build half donut chart that stays vertically not horizontally and because I've never created such a thing it was took so much time for me to build it, because I'm lazy to read docs (but writes one xd) and since I didn't read docs in recharts until I give up trying I probably spent around 3-4 hours to build the chart I want. But I couldn't.

So I started to read docs of recharts and shadcn/ui carefully after reading docs and asking few questions to Gemini (I use both ChatGPT and Gemini at the same time) I completed the chart with a single minimal problem that I still didn't fix and not sure how to fix but it's very important for now.

Problem: when usage or temp is lower than 13-14 (that number depends on the chart tickness) filled part of the chart is not showing with corner radius, because it's too small. One way to fix this could be setting a minimum range to show so if usage is %1 or %13 it'll show the same amount of filled area. Later on I may handle this or keep it as it is.

Example of what I was talking about;

![BUG in Chart](https://raw.githubusercontent.com/loeiks/nzxt-web-integration/19081129ccf757ce324f810c19aa38e511402325/image.png)

Then I have fixed this problem by changing radius of the chart to 10 from 99 xd. ([https://github.com/recharts/recharts/issues/1972](https://github.com/recharts/recharts/issues/1972))

![BUG Fixes in Chart](https://raw.githubusercontent.com/loeiks/nzxt-web-integration/refs/heads/main/preview.png)

### I Hate Frontend Development

After I've completed the chart component, it was time to bring two of these put a text between each and complete the UI that I aim for. But guess what, it took around 2-3 hours to fucking center these charts and the text inside of a grid. And it's actually still not how I want it to be but it's working as I want it to be so I don't touch it but fuck CSS, I hate that shit.

### Adding Redux (Freezing Issue)

After I complete the UI it was time to fetch the data from backend and also in the frontend for PC data, and show them in UI. I started with `setInterval` inside `useEffect` hook of React. But somehow it break the working page by freezing it, I'm not sure if it was because of wrong state changes so maybe A change was triggering B to change and creates a loop and cause performance issues like in my scenario.

After that issue I switched plan to use `WebSocket` instead of HTTP calls and that was the point where I changed backend and switched to WS. With this change I also wanted to bring in Redux for state management, I already know basics of Redux and what it's solving etc. But I didn't create any project with Redux too. So it was good idea for me to also bring Redux in, another reason was actually that performance issue that my bad state management caused.

It's great to point out that it's hard to debug because NZXT only sends data to it's own native electron application and I can't open console (dev tools) in that window I tried F12, CTRL+SHIFT+C and CTRL+SHIFT+I but none of them worked to open dev tools.

So I still don't know what was causing that performance issue or was it even performance issue xd. Maybe it was something else.

### Adding Redux and Finishing Frontend

After I've added Redux for state management with the help of ChatGPT, finally I had a working application it was time to put this into a container and run it with docker in my ubuntu server (S1).

## DevOps

Now it's time to deploy this small but uselessly complex application with `Docker Compose` I SSH into S1 and then created a dir for this project, after that pulled all files from GitHub with `git clone` now we are ready to build the image and run it with `Docker Compose`. And I did that too, it was running without any problem (ofc after many debugging). It was time to set the URL in NZXT CAM application.

## Performance Problems and Optimizations

After I deployed app and let it run for almost 10 days I saw some performance issues that I have to fix because main performance issue was a `memory leak` in frontend. Which runs on my personal PC and eats up my RAM up to 4-5gb (it can even use more if I let it run more time) which is too much. Also it was using my CPU around %2-4 which is kinda a lot since I have i5 13600K but not sure if it's normal or not. So after I notice these problems I started to optimizing my code with the help of CoPilot.

### Problems and Optimizations

There were potential optimizations in frontend which are these:

- I have removed React.Strict mode (main.tsx) because I didn't need it anymore.
- I fixed the way I use `useEffect` on `Status.tsx`, it was the main reason of high and increasing memory usage. Because I was creating multiple event listeners again and again without cleaning created ones.
- I removed NZXT data fetching from `useEffect` and moved it top of component code with an `if else` to prevent unnecessary updates/re-renders and re-attaching NZXT object to window again and again.
- In `StatusChart.tsx` I started using `useMemo` for `chartData` so if it doesn't change we prevent unnecessary updates and re-renders.
- Also in `StatusChart.tsx` I moved function inside `<Label/>` component to outside of it for better performance.
- For backend part I didn't change so much things and there wasn't any high memory or CPU usage so it was already fine but did some changes to optimize code more and learn Go more.

Now let's see if we optimized it successfully or not. Before optimization (app was running for 12h+)

**On Client Side:**
CPU: ~%2.4
RAM: ~2.15Gb

**On Server Side:**
_Backend Service:_
CPU: ~%0.08
RAM: ~4.01Mb
_Frontend Service:_
CPU: ~%0
RAM: ~7.48Mb
_NGINX Service:_
CPU: ~%0.01
RAM: ~2.35Mb

---

Ooops!! I've made some optimizations wrong by listening CoPilot (stupid AI things happens always so expect this) then I went to install React Scan to catch optimization problems and fix them and it worked good enough tbh. Now let's take a look what I have done wrong:

1. Instead of removing `useEffect` for NZXT listener I added `useEffect` back and removed `currentSource` from dependency array. I've also done the same for S1 usage collection with WS.
2. I've made some tweaks to change how animations handled in `StatusChart.tsx` which might not impact to performance.
3. I also added an `if else` in `cpuSlice.ts` because every time an update came from S1 data, we use dispatch to update data in Redux even if the data is same. With this `if else` it's not updated anymore if it's same. (I'm not sure if this is the best way to handle this, but after some research I couldn't find a better way that's actually working)
4. In backend there was a BUG with goroutines which I fixed later on and currently it's working.

Now let's take a look how is the usage after optimizations (app was running for 12h+)

**On Client Side:** <br>
CPU: ~%2.3 <br>
RAM: ~440Mb ✅

**On Server Side:** <br>
_Backend Service:_ <br>
CPU: ~%0.06 <br>
RAM: ~4.1Mb <br>
_Frontend Service:_ <br>
CPU: ~%0 <br>
RAM: ~7.4Mb <br>
_NGINX Service:_ <br>
CPU: ~%0 <br>
RAM: ~2.3Mb

I think we fixed memory leak issue as well as optimized application generally about resource usage.

---