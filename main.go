package main

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"net/http"
	"os"
	"path"
	"pimage/service"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "only post method supported"}`)
			return
		}
		if val := r.Header.Get("Authorization"); val != "Bearer "+adminPassword {
			w.WriteHeader(http.StatusUnauthorized)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "invalid token"}`)
			return
		}
		next(w, r)
	})
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	//32 << 20 =  32 MB
	r.ParseMultipartForm(32 << 20) // limit your max input length!
	log.Printf("%#v", r.MultipartForm)
	pwd, _ := os.Getwd()
	logoFile, err := os.Open(path.Join(pwd, "front/logo.png"))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "logo - file doesn't exist"}`)
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
	opacityStr := r.FormValue("opacity")
	if opacityStr == "" {
		opacityStr = "128"
	}
	opacity, err := strconv.ParseInt(opacityStr, 10, 64)
	if err != nil || opacity < 1 || opacity > 255 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "opacity - required and must be between 1 and 255"}`)
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
	service.SetOpacity(uint8(opacity))
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
		jpeg.Encode(w, result, &jpeg.Options{Quality: jpeg.DefaultQuality})
	} else {
		w.Header().Set("Content-Type", "image/png")
		png.Encode(w, result)
	}
}

var (
	adminNickName, adminPassword, bearerToken, port string
)

func main() {
	adminNickName = os.Getenv("ADMIN_NICKNAME")
	adminPassword = os.Getenv("ADMIN_PASSWORD")
	bearerToken = os.Getenv("API_BEARER_TOKEN")
	port = os.Getenv("PORT")
	if val, err := strconv.Atoi(port); err != nil || val < 1 || val > 65535 {
		log.Fatalf("given port must be valid, free and must be between 1 and 65535 \n")
	}
	if adminNickName == "" || adminPassword == "" || bearerToken == "" {
		log.Fatalf("ADMIN_NICKNAME, ADMIN_PASSWORD and API_BEARER_TOKEN required\n")
	}

	fs := http.FileServer(http.Dir("./front"))
	http.Handle("/", fs)
	http.HandleFunc("/api/watermark", apiMiddleware(apiHandler))
	http.HandleFunc("/api/auth", authHandler)
	http.HandleFunc("/watermark-zip", corsMiddleware(service.FrontHandler))
	log.Printf("trying to init server on port %s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("can't start server: ", err)
	}
}

func apiMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		if token := r.Header.Get("Authorization"); token != "Bearer "+bearerToken {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("invalid token"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	nickname := r.FormValue("nickname")
	password := r.FormValue("password")
	if nickname == adminNickName && password == adminPassword {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("invalid credentials"))
	}
}
