# URZ Studio · Polar Portfolio 2.0

북극 풍경과 기존 북극곰 마스코트로 브랜드를 표현하고, 본문은 작업 목적·역할·실제 화면을 읽기 쉬운 순서로 배치한다. 여섯 HTML 페이지는 각각 독립적으로 열 수 있다.

## 토큰

`public/assets/base.css`의 `:root`와 `:root[data-theme="dark"]`가 컬러의 기준이다. Figma에서 동일한 이름의 컬러 변수에 라이트·다크 모드를 만든다.

| Figma 변수 / CSS | 라이트 | 다크 | 용도 |
| --- | --- | --- | --- |
| Background / `--bg` | `#F7FAFC` | `#0F1924` | 페이지 배경 |
| Surface / `--surface` | `#FFFFFF` | `#192A3B` | 컨트롤, 모달, 푸터 |
| Text / `--text` | `#172637` | `#F3F8FD` | 주요 텍스트 |
| Muted / `--muted` | `#536678` | `#B6C9D8` | 보조 텍스트 |
| Divider / `--line` | `#DBE5EC` | `#364A5E` | 장식 및 콘텐츠 구분선 |
| Control border / `--control-line` | `#8196A8` | `#839CB1` | 입력·버튼 경계 |
| Soft surface / `--soft` | `#EBF4F9` | `#172636` | 콘텐츠 밴드 |
| Sky / `--sky` | `#A6E7FF` | `#A3E2FF` | 하늘색 포인트 |
| Accent / `--accent` | `#2B719B` | `#A3E2FF` | 링크, 포커스, 강조 |
| Pink / `--pink` | `#F8BAD8` | `#FFBBD9` | 보조 포인트 |
| Pink text / `--pink-text` | `#B65182` | `#FFBBD9` | 워드마크와 작은 선 |
| Primary / `--action` | `#235C7D` | `#A3E2FF` | 주요 버튼 배경 |
| On primary / `--on-action` | `#FFFFFF` | `#102333` | 주요 버튼 글자 |

- 기본 서체는 Pretendard Variable 1.3.9 기반의 자체 호스팅 서브셋 URZ Sans다. Figma에서는 원본 Pretendard Variable을 사용한다. 동적인 갤러리 제목과 메타데이터에서 서브셋에 없는 글자는 시스템 글꼴로 표시된다. 원본과 SIL OFL은 `public/assets/fonts/OFL-Pretendard.txt`에 기록했다.
- 본문 16px, 도입부 16–19px, 메타데이터 약 12.5px 이상을 기준으로 한다. 제목은 화면 너비에 따라 달라진다.
- 콘텐츠 최대 폭은 1360px이다. 바깥 여백 20–80px, 섹션 간격 58–112px, 메인 그리드 간격 20–44px, 라운드 12px와 8px를 사용한다.
- 740px 이하에서 주요 좌우 레이아웃을 세로로 배치한다. 프로젝트 그리드는 540px 이하에서 한 열이 된다. 주요 버튼과 아이콘은 기본 44px 높이다.

## 스타일과 컴포넌트

| 파일 | 기준으로 삼는 요소 |
| --- | --- |
| `base.css` | 테마, 서체, 반응형 타이포그래피, 콘텐츠 폭, 포커스, 모션 설정 |
| `components.css` | 헤더, 푸터, 버튼·필터, 정보 목록, 공용 사진·모달 패턴 |
| `pages.css` | 홈, 프로젝트, 케이스 스터디, 소개, 연락의 개별 레이아웃 |
| `gallery.css` | Masonry 전시, 앨범과 검색, 원본 이미지 모달, 작가 관리 |
| `theme.js` / `showcase.js` | 첫 화면 테마 초기화, 저장된 테마, 메뉴, 필터, 모달, 케이스 스터디 탭 |

메뉴에는 현재 페이지 밑줄, 필터에는 선택 배경, 입력에는 바깥 포커스 링을 쓴다. 주요 모달은 네이티브 `dialog`로 열리며 Escape, 배경 클릭, 닫기 버튼을 지원한다. 시스템의 모션 감소 설정을 따른다. 갤러리 원본·메타데이터는 기존 Cloudflare API를 사용한다.

## 이미지 교체와 Figma

- 홈 Hero의 `arctic-640.webp`, `arctic-1120.webp`는 사이트 전용으로 생성한 북극 풍경이다. 마스코트는 기존 `polar-bear.svg`를 쓴다.
- `bearstory-*.webp`는 공개 BEARSTORY 4컷 화면에 예시 이미지를 넣어 캡처했다. 홈과 프로젝트 페이지의 대표 작품에 사용한다.
- `anima-workspace-*.webp`는 빈 브라우저 프로필의 GCT v3.2.3 실제 작업실에 예시 이미지를 열어 캡처했다. 홈과 케이스 스터디에서 사용한다.
- `hoi4-*.webp`는 공개 HOI4 Modding Studio의 국민중점 트리 시연 화면이다.
- BEARSTORY EXT, ANIMA VideoAPI, Scene Bridge Anima Lite, 통합 빌드는 승인된 화면 자료를 확보하면 각 `.project-diagram`을 `.project-figure`로 교체할 수 있다. 작품별 보안 정보 및 개인 데이터가 없는 화면을 사용하고, 실제 비율에 맞춰 `width`와 `height`를 갱신한다.
- Figma에서는 1440px과 390px 프레임을 기준으로 네비게이션, 버튼, 프로젝트 Figure, 정보 행, 검색·필터, 모달을 컴포넌트로 정리할 수 있다. 코드의 자동 레이아웃 기준은 공용 스타일과 740px·540px 미디어 규칙을 참고한다.
