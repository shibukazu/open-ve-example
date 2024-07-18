import { useState, ChangeEvent, FormEvent } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const App = () => {
  const [price, setPrice] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
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
      setMessage(response.data.message);
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
          value={price}
          onChange={handlePriceChange}
          fullWidth
          margin="normal"
        />
        <input type="file" onChange={handleImageChange} />
        <Button type="submit" variant="contained" color="primary">
          アップロード
        </Button>
      </form>
      {message && <Typography variant="body1">{message}</Typography>}
    </Container>
  );
};

export default App;
