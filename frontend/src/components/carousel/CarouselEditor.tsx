
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlideData, TextElement, TextPosition, BackgroundType } from "./types";

// Define text size options
const TEXT_SIZE_OPTIONS = [
  { name: "Small", value: 16 },
  { name: "Medium", value: 24 },
  { name: "Large", value: 32 },
  { name: "X-Large", value: 42 }
];

// Fixed text color - white with black stroke
const TEXT_COLOR = "#FFFFFF";

interface CarouselEditorProps {
  slide: SlideData;
  updateSlide: (slide: SlideData) => void;
  downloadCurrentSlide: () => void;
}

const CarouselEditor = ({ slide, updateSlide, downloadCurrentSlide }: CarouselEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>("background");
  const [fileUploading, setFileUploading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<TextPosition>("center");
  const [fontSize, setFontSize] = useState(24); // Medium as default
  const [fontFamily, setFontFamily] = useState("Arial");

  const handleBackgroundTypeChange = (type: BackgroundType) => {
    updateSlide({
      ...slide,
      backgroundType: type,
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    updateSlide({
      ...slide,
      backgroundColor: color,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isGrid = false, gridIndex = -1) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      if (isGrid) {
        const gridImages = [...(slide.gridImages || ["", "", "", ""])];
        gridImages[gridIndex] = base64String;

        updateSlide({
          ...slide,
          gridImages,
        });
      } else {
        updateSlide({
          ...slide,
          backgroundImage: base64String,
        });
      }
      setFileUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;

    const newTextElement: TextElement = {
      id: uuidv4(),
      text: textInput,
      color: TEXT_COLOR, // Fixed white color
      fontSize,
      fontFamily,
      position: textPosition,
    };

    updateSlide({
      ...slide,
      textElements: [...slide.textElements, newTextElement],
    });

    setTextInput("");
  };

  const removeTextElement = (id: string) => {
    updateSlide({
      ...slide,
      textElements: slide.textElements.filter(el => el.id !== id),
    });
  };

  return (
    <div>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="background" className="flex-1">Фон</TabsTrigger>
          <TabsTrigger value="text" className="flex-1">Текст</TabsTrigger>
        </TabsList>
        
        <TabsContent value="background" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Тип фона</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={slide.backgroundType === "color" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("color")}
                  size="sm"
                >
                  Цвет
                </Button>
                <Button 
                  variant={slide.backgroundType === "image" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("image")}
                  size="sm"
                >
                  Изображение
                </Button>
                <Button 
                  variant={slide.backgroundType === "grid" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("grid")}
                  size="sm"
                >
                  2x2 Сетка
                </Button>
              </div>
            </div>
          </div>
          
          {slide.backgroundType === "color" && (
            <div>
              <Label htmlFor="bg-color">Цвет фона</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="bg-color"
                  type="color" 
                  value={slide.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  type="text" 
                  value={slide.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          )}
          
          {slide.backgroundType === "image" && (
            <div>
              <Label>Изображение фона</Label>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  disabled={fileUploading}
                />
                
                {slide.backgroundImage && (
                  <div className="mt-3">
                    <img 
                      src={slide.backgroundImage} 
                      alt="Предварительный просмотр фона" 
                      className="max-h-32 rounded-md border" 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {slide.backgroundType === "grid" && (
            <div>
              <Label>Изображения сетки 2x2</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true, index)}
                      className="text-xs"
                      disabled={fileUploading}
                    />
                    
                    {slide.gridImages?.[index] && (
                      <img 
                        src={slide.gridImages[index]} 
                        alt={`Изображение сетки ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md border" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="text" className="mt-4 space-y-4">
          <div>
            <Label htmlFor="text-input">Добавить текст</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Введите текст..."
                className="flex-1"
              />
              <Button onClick={addTextElement}>Добавить</Button>
            </div>
          </div>
          
          <div>
            <Label>Размер текста</Label>
            <div className="flex gap-2 mt-2">
              {TEXT_SIZE_OPTIONS.map((size) => (
                <Button 
                  key={size.name}
                  variant={fontSize === size.value ? "default" : "outline"}
                  onClick={() => setFontSize(size.value)}
                  size="sm"
                >
                  {size.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Позиция текста</Label>
            <div className="flex gap-2 mt-2">
              <Button 
                variant={textPosition === "top" ? "default" : "outline"}
                onClick={() => setTextPosition("top")}
                size="sm"
              >
                Верх
              </Button>
              <Button 
                variant={textPosition === "center" ? "default" : "outline"}
                onClick={() => setTextPosition("center")}
                size="sm"
              >
                Центр
              </Button>
              <Button 
                variant={textPosition === "bottom" ? "default" : "outline"}
                onClick={() => setTextPosition("bottom")}
                size="sm"
              >
                Низ
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Текстовые элементы</h3>
            
            {slide.textElements.length === 0 ? (
              <p className="text-muted-foreground text-sm">Текстовые элементы еще не добавлены.</p>
            ) : (
              <div className="space-y-2">
                {slide.textElements.map((element) => (
                  <div key={element.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">
                        {element.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {TEXT_SIZE_OPTIONS.find(size => size.value === element.fontSize)?.name || element.fontSize}px · {element.position}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeTextElement(element.id)}
                      className="text-destructive"
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button onClick={downloadCurrentSlide} className="w-full">
          Скачать этот слайд
        </Button>
      </div>
    </div>
  );
};

export default CarouselEditor;
