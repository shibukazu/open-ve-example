import { useState, ChangeEvent, FormEvent, FocusEvent } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const App = () => {
  const [price, setPrice] = useState<string>("");
  const [isPriceValid, setIsPriceValid] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [isImageValid, setIsImageValid] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handlePriceChange = async (e: FocusEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
    const response = await axios.post("http://localhost:8080/v1/check", {
      id: "price",
      variables: {
        number: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
        },
      },
    });
    if (response.data.isValid) {
      setIsPriceValid(true);
    } else {
      setIsPriceValid(false);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (event.target?.result) {
          const base64String = btoa(
            String.fromCharCode(
              ...new Uint8Array(event.target.result as ArrayBuffer)
            )
          );
          const response = await axios.post("http://localhost:8080/v1/check", {
            id: "image",
            variables: {
              image: {
                "@type": "type.googleapis.com/google.protobuf.BytesValue",
                value: base64String,
              },
            },
          });
          if (response.data.isValid) {
            setIsImageValid(true);
          } else {
            setIsImageValid(false);
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("price", price);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        "http://localhost:8090/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("アップロードが成功しました");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        商品アップロード
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="価格"
          variant="outlined"
          onBlur={handlePriceChange}
          fullWidth
          margin="normal"
        />
        <Typography variant="body2" color={isPriceValid ? "initial" : "error"}>
          {isPriceValid ? "価格は正常です" : "価格が異常です"}
        </Typography>
        <input type="file" onChange={handleImageChange} />
        <Typography variant="body2" color={isImageValid ? "initial" : "error"}>
          {isImageValid ? "画像は正常です" : "画像が異常です"}
        </Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isPriceValid || !isImageValid}
        >
          アップロード
        </Button>
      </form>
      {message && <Typography variant="body1">{message}</Typography>}
    </Container>
  );
};

export default App;
