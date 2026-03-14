package com.example.demo.users;

import com.example.demo.api.UsersApiDelegate;
import com.example.demo.model.CreateUserRequest;
import com.example.demo.model.PageUserDto;
import com.example.demo.model.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserController implements UsersApiDelegate {

    private final UserService userService;
    private final UserMapper userMapper;

    @Override
    public ResponseEntity<PageUserDto> getAllUsers(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDto> resultPage = userService.findAll(pageable);
        PageUserDto response = userMapper.toPageDto(resultPage);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<UserDto> createUser(CreateUserRequest createUserRequest) {
        UserDto created = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<UserDto> getUserById(UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteUser(UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
