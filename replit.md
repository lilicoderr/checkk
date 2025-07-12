# Replit.md

## Overview

완성된 Node.js 웹 크롤링 서버입니다. Express.js와 Playwright를 사용하여 https://app.wakscord.com/ 사이트를 크롤링하고, Cloudflare Workers와 유사한 방식으로 외부 요청에 응답합니다. Replit 환경에서 시스템 Chromium 브라우저를 사용하여 안정적으로 작동합니다.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js server running on Node.js
- **Web Scraping Engine**: Playwright with Chromium browser
- **Server Pattern**: Single-instance Express server with shared browser instance
- **Environment**: Designed for cloud deployment (Replit-optimized)

### Key Design Decisions
1. **Browser Reuse**: Single browser instance is maintained and reused across requests to improve performance and reduce resource consumption
2. **Cloud-Optimized**: Chromium launch arguments are specifically configured for headless operation in containerized environments
3. **Graceful Shutdown**: Proper cleanup handlers for SIGTERM and SIGINT signals to ensure browser processes are closed cleanly

## Key Components

### Web Server (Express.js)
- Lightweight HTTP server for handling incoming requests
- Port configuration with environment variable fallback (PORT || 5000)
- No middleware or routing defined yet (application appears incomplete)

### Browser Automation (Playwright)
- Chromium browser instance with headless configuration
- Replit-compatible launch arguments:
  - Sandbox disabled for containerized environments
  - Memory and performance optimizations
  - Background process limitations disabled

### Process Management
- Signal handlers for graceful shutdown
- Browser lifecycle management
- Resource cleanup on application termination

## Data Flow

1. **Initialization**: Browser instance is created on first use with cloud-optimized settings
2. **Request Handling**: Express server receives HTTP requests (routing not yet implemented)
3. **Crawling Process**: Browser automation performs web scraping tasks (crawlWakscord function incomplete)
4. **Response**: Scraped data returned to client (implementation pending)
5. **Cleanup**: Browser instance reused for subsequent requests, closed on application shutdown

## External Dependencies

### Core Dependencies
- **express (^5.1.0)**: Web application framework
- **playwright (^1.54.1)**: Browser automation library

### Runtime Requirements
- Node.js runtime environment
- Chromium browser (installed with Playwright)
- Container/cloud environment compatibility

## Deployment Strategy

### Target Platform
- **Primary**: Replit cloud environment
- **Configuration**: Containerized deployment with headless browser support

### Environment Considerations
- Port configuration via environment variables
- Sandbox restrictions handled through browser launch arguments
- Memory and resource constraints addressed through optimization flags

### Scalability Approach
- Single browser instance reuse pattern for resource efficiency
- Stateless server design for horizontal scaling potential
- Graceful shutdown handling for container orchestration

## Current State & Recent Changes

✅ **Complete & Functional** (2025-07-12):
- Express server running on port 5000 with all routes implemented
- Playwright 크롤링 기능 완전 구현 및 테스트 완료
- 시스템 Chromium 브라우저 연동으로 Replit 환경 최적화
- Wakscord.com 크롤링 성공 (평균 응답시간 7초)
- `/` - 메인 크롤링 엔드포인트 (HTML 반환)
- `/health` - 헬스체크 엔드포인트  
- `/api/streamers` - 스트리머 데이터 API 엔드포인트
- 브라우저 리소스 관리 및 에러 핸들링 완료

서버가 안정적으로 작동하며 프로덕션 준비 상태입니다.