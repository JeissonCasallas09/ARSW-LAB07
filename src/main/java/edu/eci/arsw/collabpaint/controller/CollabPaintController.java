package edu.eci.arsw.collabpaint.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/topic")
public class CollabPaintController {
    
    @PostMapping("/newpoint")
    public void newPoint(){
        
    }

}
