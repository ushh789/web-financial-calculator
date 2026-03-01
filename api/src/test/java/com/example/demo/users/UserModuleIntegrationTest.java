//package com.example.demo.users;
//
//import com.example.demo.model.CreateUserRequest;
//import com.example.demo.model.UserDto;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.modulith.test.ApplicationModuleTest;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//
//@ApplicationModuleTest
//@Transactional
//class UserModuleIntegrationTest {
//
//    @Autowired
//    private UserService userService;
//
//    @Autowired
//    private RoleRepository roleRepository;
//
//    @BeforeEach
//    void setUp() {
//        if (roleRepository.findByName("USER").isEmpty()) {
//            Role userRole = new Role();
//            userRole.setName("USER");
//            roleRepository.save(userRole);
//        }
//    }
//
//    @Test
//    void shouldCreateAndFindUser() {
//        CreateUserRequest request = new CreateUserRequest()
//                .username("testuser")
//                .email("test@example.com")
//                .role("USER");
//
//        UserDto createdUser = userService.createUser(request);
//
//        assertThat(createdUser).isNotNull();
//        assertThat(createdUser.getUsername()).isEqualTo("testuser");
//
//        Optional<UserDto> foundById = userService.findById(createdUser.getId());
//        assertThat(foundById).isPresent();
//        assertThat(foundById.get().getEmail()).isEqualTo("test@example.com");
//    }
//
//    @Test
//    void shouldFailToCreateUserWithDuplicateEmail() {
//        CreateUserRequest request1 = new CreateUserRequest()
//                .username("user1")
//                .email("duplicate@example.com")
//                .role("USER");
//        userService.createUser(request1);
//
//        CreateUserRequest request2 = new CreateUserRequest()
//                .username("user2")
//                .email("duplicate@example.com")
//                .role("USER");
//
//        assertThatThrownBy(() -> userService.createUser(request2))
//                .isInstanceOf(IllegalArgumentException.class)
//                .hasMessageContaining("Email already in use");
//    }
//
//    @Test
//    void shouldDeleteUser() {
//        CreateUserRequest request = new CreateUserRequest()
//                .username("todelete")
//                .email("delete@example.com")
//                .role("USER");
//        UserDto createdUser = userService.createUser(request);
//
//        userService.deleteUser(createdUser.getId());
//
//        Optional<UserDto> foundUser = userService.findById(createdUser.getId());
//        assertThat(foundUser).isNotPresent();
//    }
//}