package com.philips.customui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * This class contains the end point for the single page UI application
 * 
 * @author Kiran Kumar G
 * @author Shaheen Shaikh
 */
@Controller
public class AuthAuthzController {

  /**
   * This endpoint fetches the Access-Management HOST URL from deployment environment and invokes the view.
   */
  @GetMapping ("/customerapplication")
  public String customLoginV2 (Model model) {

    String amUrl = System.getenv ("AM_HOST");
    model.addAttribute ("am_url", amUrl);
    return "customerapplication";
  }
  
  @GetMapping("/home")
  public String homeView(Model model) {
    
    return "home";
  }

}
