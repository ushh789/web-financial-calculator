package com.example.demo.users;

import com.example.demo.model.CreateUserRequest;
import com.example.demo.model.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserDto> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findById(UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toDto);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = userMapper.toEntity(request);
        
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (StringUtils.hasText(request.getRole())) {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        } else {
            user.setRole(Role.USER);
        }
        
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}
