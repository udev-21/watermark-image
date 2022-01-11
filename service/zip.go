package service

import (
	"archive/zip"
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"
)

type order struct {
	imageContentType string
	scale            int
	posX             int
	posY             int
	image            image.Image
	opacity          uint8
}

func FrontHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	//200 << 20 =  200 MB
	r.ParseMultipartForm(200 << 20) // limit your max input length!

	// logoFile, logoFileHeader, err := r.FormFile("logo")
	// if err != nil {
	// 	w.Header().Set("Content-Type", "application/json")
	// 	w.WriteHeader(http.StatusBadRequest)
	// 	fmt.Fprintf(w, `{"error": "logo - png file required"}`)
	// 	return
	// }
	pwd, _ := os.Getwd()
	logoFile, err := os.Open(path.Join(pwd, "front/logo.png"))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"error": "logo - file doesn't exist"}`)
		return
	}
	defer logoFile.Close()

	logo, err := png.Decode(logoFile)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "can't decode logo: "`+err.Error()+`}`)
		return
	}

	formData := r.Form
	multipartFormData := r.MultipartForm

	var scales []string
	var posXes []string
	var posYes []string
	var opacities []string

	var ok bool
	if scales, ok = formData["scale"]; !ok {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "scales - required"}`)
		return
	}
	if posXes, ok = formData["logox"]; !ok {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "scales - required"}`)
		return
	}
	if posYes, ok = formData["logoy"]; !ok {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "scales - required"}`)
		return
	}
	if opacities, ok = formData["opacity"]; !ok {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "scales - required"}`)
		return
	}

	if !(len(posXes) == len(posYes) && len(posYes) == len(scales) && len(posYes) == len(opacities)) {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "length of scale and logox and logoy and opacity must be same"}`)
		return
	}

	images, ok := multipartFormData.File["image"]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "image required"}`)
		return
	} else if len(images) != len(scales) {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"error": "lengths of image and scale must be same"}`)
		return
	}
	orders := []order{}
	for idx, image := range images {
		order := order{}
		imageContentType := image.Header.Get("Content-Type")
		if !(imageContentType == "image/jpeg" || imageContentType == "image/jpg" || imageContentType == "image/png") {
			w.WriteHeader(http.StatusBadRequest)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "image - must be a jpeg or png image"}`)
			return
		}
		uploadedFile, err := image.Open()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "something went wrong while reading uploaded files"}`)
			return
		}
		if imageContentType == "image/png" {
			order.image, err = png.Decode(uploadedFile)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"error": "something went wrong while decoding uploaded files"}`)
				return
			}
		} else {
			order.image, err = jpeg.Decode(uploadedFile)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"error": "something went wrong while decoding uploaded files"}`)
				return
			}
		}
		scale, err := strconv.ParseInt(scales[idx], 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "scale must be valid integer"}`)
			return
		}
		order.scale = int(scale)

		posx, err := strconv.ParseInt(posXes[idx], 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "posx must be valid integer"}`)
			return
		}
		order.posX = int(posx)
		posy, err := strconv.ParseInt(posYes[idx], 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "posy must be valid integer"}`)
			return
		}
		order.posY = int(posy)
		order.imageContentType = imageContentType
		opacity, err := strconv.ParseInt(opacities[idx], 10, 64)
		if err != nil || opacity < 1 || opacity > 255 {
			w.WriteHeader(http.StatusBadRequest)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "opacity required and must be between 1 and 255"}`)
			return
		}
		order.opacity = uint8(opacity)

		orders = append(orders, order)
		uploadedFile.Close()
	}

	buffer := bytes.Buffer{}
	zipWriter := zip.NewWriter(&buffer)

	for idx, order := range orders {
		service := NewWatermarkService(order.image, logo)
		service.ResizeLogo(order.scale)
		service.SetOffset(order.posX, order.posY)
		service.SetOpacity(order.opacity)
		result, err := service.MergeLogo()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"error": "can't merge images: %s"}`, err.Error())
			return
		}
		if order.imageContentType == "image/png" {
			w1, err := zipWriter.Create(fmt.Sprintf("%d.png", idx))
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"error": "can't create new file inside zip: %s"}`, err.Error())
				return
			}
			png.Encode(w1, result)
		} else {
			w1, err := zipWriter.Create(fmt.Sprintf("%d.jpeg", idx))
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"error": "can't create new file inside zip: %s"}`, err.Error())
				return
			}
			jpeg.Encode(w1, result, &jpeg.Options{Quality: jpeg.DefaultQuality})
		}

	}
	zipWriter.Close()
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.zip\"", time.Now().Format("2006-01-02_15:04:05")))
	w.Write(buffer.Bytes())
}

func getFileContentType(out *os.File) (string, error) {

	// Only the first 512 bytes are used to sniff the content type.
	buffer := make([]byte, 512)

	_, err := out.Read(buffer)
	if err != nil {
		return "", err
	}

	// Use the net/http package's handy DectectContentType function. Always returns a valid
	// content-type by returning "application/octet-stream" if no others seemed to match.
	contentType := http.DetectContentType(buffer)

	return contentType, nil
}
