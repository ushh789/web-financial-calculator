package com.example.demo.auth;

import com.example.demo.api.AuthApiDelegate;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.UserDto;
import com.example.demo.users.User;
import com.example.demo.users.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthController implements AuthApiDelegate {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final RefreshTokenService refreshTokenService;
    private final CookieService cookieService;
    private final UserMapper userMapper;
    private final HttpServletRequest request;

    @Value("${app.jwt.access-token-duration-ms}")
    private Long accessTokenDurationMs;
    @Value("${app.jwt.refresh-token-duration-ms}")
    private Long refreshTokenDurationMs;
    @Value("${app.jwt.refresh-token-cookie-name}")
    private String refreshTokenCookieName;

    @Override
    public ResponseEntity<UserDto> login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        String accessToken = generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(accessToken, accessTokenDurationMs).toString());
        headers.add(HttpHeaders.SET_COOKIE, cookieService.createRefreshTokenCookie(refreshToken.getToken(), refreshTokenDurationMs).toString());

        return ResponseEntity.ok().headers(headers).body(userMapper.toDto(user));
    }

    @Override
    public ResponseEntity<UserDto> refreshToken() {
        String refreshTokenString = cookieService.readCookie(request, refreshTokenCookieName)
                .orElseThrow(() -> new RuntimeException("Refresh token is not found in cookie!"));

        return refreshTokenService.findByToken(refreshTokenString)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = generateAccessToken(user);
                    HttpHeaders headers = new HttpHeaders();
                    headers.add(HttpHeaders.SET_COOKIE, cookieService.createAccessTokenCookie(accessToken, accessTokenDurationMs).toString());

                    return ResponseEntity.ok().headers(headers).body(userMapper.toDto(user));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Override
    public ResponseEntity<Void> logout() {
        cookieService.readCookie(request, refreshTokenCookieName)
                .flatMap(refreshTokenService::findByToken)
                .ifPresent(rt -> refreshTokenService.deleteByUserId(rt.getUser().getId()));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookieService.deleteAccessTokenCookie().toString());
        headers.add(HttpHeaders.SET_COOKIE, cookieService.deleteRefreshTokenCookie().toString());

        return ResponseEntity.noContent().headers(headers).build();
    }

    private String generateAccessToken(Authentication authentication) {
        Instant now = Instant.now();
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusMillis(accessTokenDurationMs))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();

        return this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private String generateAccessToken(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null, user.getAuthorities());
        return generateAccessToken(authentication);
    }
}
