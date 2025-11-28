package com.paf.Api.Controller;

import com.paf.Api.Dto.UserRequest;
import com.paf.Api.Dto.UserResponse;
import com.paf.Domain.Models.UserModel;
import com.paf.Domain.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/UserGet")
    public ResponseEntity<UserResponse> GetbyName(@RequestParam String nome) {
        UserModel m = userService.GetByName(nome);
        if (m == null) return ResponseEntity.notFound().build();
        UserResponse r = new UserResponse();
        r.setIdUser(m.getIdUser());
        r.setNome(m.getNome());
        r.setEmail(m.getEmail());
        r.setSenha(m.getSenha());
        return ResponseEntity.ok(r);
    }

    @PostMapping("/UserPost")
    public ResponseEntity<UserResponse> CreateUser(@RequestBody UserRequest userRequest) {
        // map DTO -> domain model
        UserModel model = new UserModel();
        model.setNome(userRequest.getNome());
        model.setEmail(userRequest.getEmail());
        model.setSenha(userRequest.getSenha());

        String result = userService.CreateUser(model);

        // prepare response
        UserResponse response = new UserResponse();
        response.setIdUser(model.getIdUser());
        response.setNome(model.getNome());
        response.setEmail(model.getEmail());
        response.setSenha(model.getSenha());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/UserDel/{id}")
    public ResponseEntity<Void> DeleteUser(@PathVariable Long id) {
        boolean ok = userService.DeleteUser(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/UserUpdt")
    public ResponseEntity<UserResponse> UpdateUser(@RequestBody UserRequest userRequest) {
        UserModel model = new UserModel();
        model.setIdUser(userRequest.getIdUser());
        model.setNome(userRequest.getNome());
        model.setEmail(userRequest.getEmail());
        model.setSenha(userRequest.getSenha());

        UserModel updated = userService.UpdateUser(model);
        if (updated == null) return ResponseEntity.notFound().build();

        UserResponse r = new UserResponse();
        r.setIdUser(updated.getIdUser());
        r.setNome(updated.getNome());
        r.setEmail(updated.getEmail());
        r.setSenha(updated.getSenha());

        return ResponseEntity.ok(r);
    }

    @GetMapping("/GetAllUsers")
    public ResponseEntity<Iterable<UserModel>> GetAllUsers() {
        Iterable<UserModel> users = userService.GetAllUsers();
        return ResponseEntity.ok(users);

    }
}
