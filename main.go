package main

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"net/http"
	"pimage/service"
	"strconv"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			if r.Method == "OPTIONS" {
				r.Header.Set("Access-Control-Allow-Methods", "POST")
				r.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Max-Age", "86400")
				w.WriteHeader(http.StatusOK)
				return
			} else if r.Method != http.MethodPost {
				w.WriteHeader(http.StatusMethodNotAllowed)
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"error": "only post method supported"}`)
				return
			}
		}
		next(w, r)
	})
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	//32 << 20 =  32 MB
	r.ParseMultipartForm(32 << 20) // limit your max input length!

	logoFile, logoFileHeader, err := r.FormFile("logo")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "logo - png file required"}`)
		return
	}

	logoContentType := logoFileHeader.Header.Get("Content-Type")
	if logoContentType != "image/png" {
		//set header to json
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "logo - must be a png image"}`)
		return
	}

	defer logoFile.Close()
	imageFile, imageFileHeader_, err := r.FormFile("image")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "image - (jpeg, jpg, png) file required"}`)
		return
	}
	defer imageFile.Close()
	imageContentType := imageFileHeader_.Header.Get("Content-Type")
	if !(imageContentType == "image/jpeg" || imageContentType == "image/jpg" || imageContentType == "image/png") {
		//set header to json
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "image - must be a jpeg or png image"}`)
		return
	}
	scaleStr := r.FormValue("scale")
	if scaleStr == "" {
		scaleStr = "100"
	}
	scale, _ := strconv.ParseInt(scaleStr, 10, 64)
	if scale < 1 || scale > 400 {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "scale - must be between 1 and 400"}`)
		return
	}

	posXStr := r.FormValue("logox")
	if posXStr == "" {
		posXStr = "0"
	}
	posX, _ := strconv.ParseInt(posXStr, 10, 64)

	posYStr := r.FormValue("logoy")
	if posYStr == "" {
		posYStr = "0"
	}
	posY, _ := strconv.ParseInt(posYStr, 10, 64)
	//get logoposition
	logoPosition := r.FormValue("logoposition")

	var background image.Image
	if imageContentType == "image/jpeg" || imageContentType == "image/jpg" {
		background, err = jpeg.Decode(imageFile)
	} else {
		background, err = png.Decode(imageFile)
	}

	if err != nil {
		//set header to json
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "can't decode image"}`)
		return
	}
	logo, err := png.Decode(logoFile)
	if err != nil {
		//set header to json
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "can't decode logo"}`)
		return
	}

	service := service.NewWatermarkService(background, logo)
	service.ResizeLogo(int(scale))
	service.SetOffset(int(posX), int(posY))
	if logoPosition != "" {
		service.SetLogoPosition(logoPosition)
	}
	result, err := service.MergeLogo()
	if err != nil {
		//set header to json
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "can't merge images: %s"}`, err.Error())
		return
	}

	if imageContentType == "image/jpeg" || imageContentType == "image/jpg" {
		w.Header().Set("Content-Type", "image/jpeg")
		jpeg.Encode(w, result, &jpeg.Options{jpeg.DefaultQuality})
	} else {
		w.Header().Set("Content-Type", "image/png")
		png.Encode(w, result)
	}
	return
}

func main() {
	fs := http.FileServer(http.Dir("./front"))
	http.Handle("/", fs)
	http.HandleFunc("/watermark", corsMiddleware(apiHandler))
	http.HandleFunc("/watermark-zip", corsMiddleware(service.FrontHandler))
	http.ListenAndServe(":8080", nil)
}
