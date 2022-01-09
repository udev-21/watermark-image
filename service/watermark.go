package service

import (
	"errors"
	"image"
	"image/color"
	"image/draw"
	_ "image/jpeg"
	_ "image/png"

	"github.com/nfnt/resize"
)

type WatermarkService struct {
	Image  image.Image
	Logo   image.Image
	Offset image.Point
}

func NewWatermarkService(image, logo image.Image) *WatermarkService {
	return &WatermarkService{
		Image: image,
		Logo:  logo,
	}
}

func (ir *WatermarkService) SetOffset(x, y int) {
	ir.Offset = image.Point{x, y}
}

func (ir *WatermarkService) ResizeLogo(scale int) {
	width := uint(ir.Logo.Bounds().Max.X * scale / 100)
	ir.Logo = resize.Resize(width, 0, ir.Logo, resize.Lanczos3)
}
func (ir *WatermarkService) MergeLogo() (image.Image, error) {

	//create a mask for make logo transparent 50%
	mask := image.NewUniform(color.Alpha{128})

	//Create a new blank image m
	m := image.NewRGBA(ir.Image.Bounds())
	//draw background image over m
	draw.Draw(m, ir.Image.Bounds(), ir.Image, image.Point{}, draw.Src)

	//Now paste logo image over m using a mask (ref. http://golang.org/doc/articles/image_draw.html )
	//******Goal is to have opacity value 50 of logo image, when we paste it****
	draw.DrawMask(m, ir.Logo.Bounds().Add(ir.Offset), ir.Logo, image.Point{}, mask, ir.Offset, draw.Over)

	return m, nil
}

func (ir *WatermarkService) SetLogoPosition(position string) error {
	switch position {
	case "TopLeft", "":
		ir.Offset = image.Point{0, 0}
	case "TopRight":
		ir.Offset = image.Point{ir.Image.Bounds().Max.X - ir.Logo.Bounds().Max.X, 0}
	case "BottomLeft":
		ir.Offset = image.Point{0, ir.Image.Bounds().Max.Y - ir.Logo.Bounds().Max.Y}
	case "BottomRight":
		ir.Offset = image.Point{ir.Image.Bounds().Max.X - ir.Logo.Bounds().Max.X, ir.Image.Bounds().Max.Y - ir.Logo.Bounds().Max.Y}
	default:
		return errors.New("invalid position")
	}
	return nil
}
