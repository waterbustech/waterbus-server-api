> [!IMPORTANT]  
> Waterbus Server API is migration to v2.


<div align="center">
<img src="./images/banner-waterbus.png" width="70%"/>
</div>

<h2 align="center">Waterbus Server API</h2>
<div class="badges" align="center">
<p><a href="https://codecov.io/gh/waterbustech/waterbus"><img src="https://codecov.io/gh/waterbustech/waterbus/branch/main/graph/badge.svg?token=7KEMH26LHZ" alt="codecov"></a><a href="https://www.codefactor.io/repository/github/waterbustech/waterbus"><img src="https://www.codefactor.io/repository/github/waterbustech/waterbus/badge" alt="CodeFactor"></a><img src="https://img.shields.io/github/actions/workflow/status/waterbustech/waterbus/ci.yml" alt="GitHub Workflow Status (with event)"><img src="https://img.shields.io/github/issues/waterbustech/waterbus" alt="GitHub issues"><a href="https://chromium.googlesource.com/external/webrtc/+/branch-heads/6099"><img src="https://img.shields.io/badge/libwebrtc-122.6261.01-yellow.svg" alt="libwebrtc"></a><img src="https://img.shields.io/cocoapods/v/KaiRTC" alt="Cocoapods Version"><a href="https://github.com/lambiengcode"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat&amp;logo=github" alt="PRs Welcome"></a></p>
</div>
<div align="center">
<a href="https://twitter.com/waterbustech"><img src="https://img.shields.io/twitter/follow/waterbus.tech?style=social" alt="Twitter Follow"></a><a href="https://discord.gg/mfrWVefU"><img alt="Discord" src="https://img.shields.io/discord/1220616225521143818"></a>
</div>
<p align="center">
  <a href="https://docs.waterbus.tech">Website</a> &bull;
  <a href="https://github.com/waterbustech/waterbus/wiki">Wiki</a> &bull;
  <a href="https://github.com/waterbustech/waterbus/blob/main/LICENSE">License</a>
</p>

## 📗 Table of Contents
- [📗 Table of Contents](#-table-of-contents)
- [👋 Introduction](#-introduction)
  - [✨ Features](#-features)
- [🚀 Quick run](#-quick-run)
  - [👇 Requirements](#-requirements)
- [🔗 Links](#-links)

## 👋 Introduction

- 🤙 Waterbus is open source video conferencing multiplatform app built on latest WebRTC SDK. This is server api for the application. 
- 🎯 Waterbus aims for scalability and low latency as well as self-hosted and offers many useful features for everyday interviews or meetings.

### ✨ Features

- [x] Login with Google
- [x] Refresh Token
- [x] Authenticate gRPC
- [x] Users
  - [x] Get info user
  - [x] Update info user
- [ ] Meetings
  - [x] Create meeting
  - [x] Update meeting
  - [x] Users management
    - [x] Join/Leave meeting
    - [x] Invite user
    - [x] Remove user
    - [x] Accept invitation
  - [ ] Code Editor
    - [ ] Create record
    - [ ] Update record
  - [ ] Notes
    - [ ] Create note
    - [ ] Update note
- [x] Chats
  - [x] Get conversations by user
  - [x] Get messages by conversation
  - [x] Send message
  - [x] Edit message
  - [x] Delete message
  - [x] Delete conversations

## 🚀 Quick run

### 👇 Requirements

Before getting started, ensure you have the following software installed:

- `Node.js`: (>= 18)
- `NestJS CLI`: (>= 9.1.7)
- `Postgres`
- `Typesense`: (26.0)

- Clone repository

```sh
git clone https://github.com/waterbustech/waterbus-server-api.git
cd waterbus-server-api/
```

- Create .env file

```sh
cp env-example .env
```

- Install dependencies

```sh
yarn
```

- Start server

```sh
yarn start
```

## 🔗 Links

- 📢 [waterbus.netlify.app](http://waterbus.netlify.app/): Home page to introduce products and features.
- 🌍 [meet.waterbus.tech](http://meet.waterbus.tech/): Web version of `waterbus` with features for online meetings
- 📖 [Documentation](http://docs.waterbus.tech/): for developers.
  - [Design](https://docs.waterbus.tech/server/design): ERD, Architecture and SFU
  - [API Documentation](https://docs.waterbus.tech/server/api): OpenAPI

<h4 align="center">Built with 💙 by the Waterbus team.</h4>
