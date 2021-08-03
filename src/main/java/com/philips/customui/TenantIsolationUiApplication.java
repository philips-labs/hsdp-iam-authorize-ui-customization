/*
 * (C) Koninklijke Philips Electronics N.V. 2018
 * 
 * All rights are reserved. Reproduction or transmission in whole or in part, in any form or by any
 * means, electronic, mechanical or otherwise, is prohibited without the prior written consent of
 * the copyright owner.
 */

package com.philips.customui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * @author Kiran Kumar G
 * @author Shaheen Shaikh
 */
@SpringBootApplication
public class TenantIsolationUiApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(TenantIsolationUiApplication.class, args);
	}
	
	 @Override
   protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
       return application.sources(TenantIsolationUiApplication.class);
   }
}
