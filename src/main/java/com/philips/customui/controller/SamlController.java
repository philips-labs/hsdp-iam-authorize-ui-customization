/*
 * (C) Koninklijke Philips Electronics N.V. 2019
 * 
 * All rights are reserved. Reproduction or transmission in whole or in part, in any form or by any
 * means, electronic, mechanical or otherwise, is prohibited without the prior written consent of
 * the copyright owner.
 */
package com.philips.customui.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.client.RestTemplate;

/**
 * This class contains the end point to accept saml assertion
 * 
 * @author Kiran Kumar G
 */
@Controller
public class SamlController {

	private RestTemplate restTemplate = new RestTemplate();
	
	private String amUrl = System.getenv("AM_HOST");
	private String samlClient = System.getenv("SAML_CLIENT");

	@PostMapping("/testRedirect")
	public String proxyPostMethod(HttpServletRequest request, Model model) {
		Map<String, String[]> parameterMap = request.getParameterMap();
		String assertion = parameterMap.get("SAMLResponse")[0];
		String shortAssertion = assertion.substring(0, 20) + "..." + ""
				+ assertion.substring(assertion.length() - 10);
		String accessToken = getAccessToken(assertion);
		String shortAccessToken = accessToken.substring(0, 4) + "..." + ""
				+ accessToken.substring(accessToken.length() - 4);
		model.addAttribute("assertion", shortAssertion);
		model.addAttribute("accessToken", shortAccessToken);
		return "samltestapp";
	}

	private String getAccessToken(String assertion) {
		String decodedAssertion = "";
		try{
			//RestTemplate does url encoding before posting the request. So the assertion is url decoded 
			//as AM returns the url encoded value.
			decodedAssertion = java.net.URLDecoder.decode(assertion, java.nio.charset.StandardCharsets.UTF_8.name());
		}catch(java.io.UnsupportedEncodingException e){
			e.printStackTrace();
		}
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		List<MediaType> mediaTypes = new ArrayList<MediaType>();
		mediaTypes.add(MediaType.APPLICATION_JSON);
		headers.setAccept(mediaTypes);
		MultiValueMap<String, String> map= new LinkedMultiValueMap<>();
		map.add("grant_type", "urn:ietf:params:oauth:grant-type:saml2-bearer");
		map.add("client_id", samlClient);
		map.add("assertion", decodedAssertion);
		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
		ResponseEntity<TokenResponse> response = restTemplate.postForEntity(amUrl+"/authorize/oauth2/token", request , TokenResponse.class);
		return response.getBody().getAccess_token();
	}
}
