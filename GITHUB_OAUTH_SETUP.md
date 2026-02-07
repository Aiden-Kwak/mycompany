# GitHub OAuth Setup Guide

## 🔐 GitHub OAuth App 설정하기

이 가이드는 My Dev Company 앱에서 GitHub 로그인을 활성화하는 방법을 설명합니다.

## 📋 단계별 가이드

### 1. GitHub OAuth App 생성

1. **GitHub에 로그인**하고 다음 URL로 이동:
   ```
   https://github.com/settings/developers
   ```

2. **"OAuth Apps"** 탭 클릭

3. **"New OAuth App"** 버튼 클릭

4. **애플리케이션 정보 입력**:
   ```
   Application name: My Dev Company
   Homepage URL: http://localhost:3000
   Application description: AI-Powered Application Development Platform
   Authorization callback URL: http://localhost:8000/accounts/github/login/callback/
   ```

5. **"Register application"** 클릭

6. **Client ID**와 **Client Secret** 복사
   - Client ID는 바로 보입니다
   - Client Secret은 "Generate a new client secret" 클릭 후 복사

### 2. Django Admin에서 Social App 설정

1. **슈퍼유저 생성** (아직 없다면):
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py createsuperuser
   ```
   - Username, Email, Password 입력

2. **Django Admin 접속**:
   ```
   http://localhost:8000/admin/
   ```

3. **로그인** (위에서 만든 슈퍼유저 계정)

4. **"Sites" 섹션**으로 이동:
   - "Sites" 클릭
   - "example.com" 항목 클릭
   - Domain name을 `localhost:8000`으로 변경
   - Display name을 `My Dev Company`로 변경
   - "Save" 클릭

5. **"Social applications" 섹션**으로 이동:
   - "Social applications" 클릭
   - "Add social application" 버튼 클릭

6. **Social Application 정보 입력**:
   ```
   Provider: GitHub
   Name: GitHub OAuth
   Client id: [위에서 복사한 Client ID]
   Secret key: [위에서 복사한 Client Secret]
   Sites: localhost:8000 선택 (오른쪽으로 이동)
   ```

7. **"Save"** 클릭

### 3. 환경 변수 설정 (선택사항)

`.env` 파일에 추가 (이미 Django Admin에서 설정했다면 선택사항):

```bash
# GitHub OAuth (Django Admin에서 설정했다면 불필요)
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

### 4. 테스트

1. **프론트엔드 접속**:
   ```
   http://localhost:3000
   ```

2. **로그인 페이지로 리다이렉트** 확인

3. **"Continue with GitHub"** 버튼 클릭

4. **GitHub 인증 페이지**로 이동 확인

5. **권한 승인** 후 앱으로 돌아오는지 확인

## 🚨 문제 해결

### "SocialApp.DoesNotExist" 에러

**원인**: Site domain이 잘못 설정되었거나 Social Application이 올바른 Site에 연결되지 않음

**해결 방법**:
1. Django Admin에서 Sites 섹션 확인
   - Domain name이 `localhost:8000`인지 확인 (⚠️ `http://` 없이!)
   - `http://localhost:8000`이나 `http://localhost:8000/`는 잘못된 설정입니다

2. Social Application이 올바른 Site에 연결되었는지 확인
   - Sites에 `localhost:8000`이 선택되어 있는지 확인

**빠른 수정 명령어**:
```bash
cd backend
source venv/bin/activate
python manage.py shell -c "from django.contrib.sites.models import Site; from allauth.socialaccount.models import SocialApp; site = Site.objects.get(id=1); site.domain = 'localhost:8000'; site.save(); app = SocialApp.objects.get(provider='github'); app.sites.clear(); app.sites.add(site); print('수정 완료!')"
```

**설정 확인 명령어**:
```bash
python manage.py shell -c "from django.contrib.sites.models import Site; from allauth.socialaccount.models import SocialApp; print('=== Sites ==='); [print(f'ID: {s.id}, Domain: {s.domain}') for s in Site.objects.all()]; print('\n=== Social Apps ==='); [print(f'Provider: {app.provider}, Sites: {[s.domain for s in app.sites.all()]}') for app in SocialApp.objects.all()]"
```

**올바른 출력 예시**:
```
=== Sites ===
ID: 1, Domain: localhost:8000

=== Social Apps ===
Provider: github, Sites: ['localhost:8000']
```

### "Redirect URI mismatch" 에러
- GitHub OAuth App의 Authorization callback URL이 정확한지 확인
- 반드시 `http://localhost:8000/accounts/github/login/callback/`이어야 함

### 로그인 후 리다이렉트 안됨
- Frontend의 callback 페이지가 제대로 작동하는지 확인
- 브라우저 콘솔에서 에러 확인

## 📝 프로덕션 배포 시

프로덕션 환경에서는 다음을 변경해야 합니다:

1. **새로운 GitHub OAuth App 생성** (프로덕션용)
   ```
   Homepage URL: https://yourdomain.com
   Authorization callback URL: https://yourdomain.com/accounts/github/login/callback/
   ```

2. **Django Admin에서 새로운 Site 추가**
   ```
   Domain name: yourdomain.com
   Display name: My Dev Company
   ```

3. **Social Application 업데이트**
   - 프로덕션용 Client ID/Secret 사용
   - 프로덕션 Site 선택

## ✅ 완료!

이제 사용자들이 GitHub 계정으로 로그인할 수 있습니다! 🎉

## 🔗 참고 링크

- [django-allauth 문서](https://django-allauth.readthedocs.io/)
- [GitHub OAuth 문서](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Django Sites Framework](https://docs.djangoproject.com/en/5.0/ref/contrib/sites/)

---

Made with ❤️ by Bob