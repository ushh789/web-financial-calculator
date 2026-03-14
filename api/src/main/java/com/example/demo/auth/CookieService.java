package com.example.demo.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpCookie;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class CookieService {
    @Value("${app.jwt.access-token-cookie-name}")
    private String accessTokenCookieName;

    @Value("${app.jwt.refresh-token-cookie-name}")
    private String refreshTokenCookieName;

    public HttpCookie createAccessTokenCookie(@NonNull String token, Long duration) {
        return ResponseCookie.from(accessTokenCookieName, token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(duration / 1000)
                .sameSite("Lax")
                .build();
    }

    public HttpCookie createRefreshTokenCookie(String token, Long duration) {
        return ResponseCookie.from(refreshTokenCookieName, token)
                .httpOnly(true)
                .secure(true)
                .path("/auth")
                .maxAge(duration / 1000)
                .sameSite("Lax")
                .build();
    }

    public HttpCookie deleteAccessTokenCookie() {
        return ResponseCookie.from(accessTokenCookieName, "").maxAge(0).path("/").build();
    }

    public HttpCookie deleteRefreshTokenCookie() {
        return ResponseCookie.from(refreshTokenCookieName, "").maxAge(0).path("/auth").build();
    }

    public Optional<String> readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findAny();
    }
}
