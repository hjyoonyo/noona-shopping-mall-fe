import React, { useState, useEffect } from "react";
import { Form, Modal, Button, Row, Col, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CloudinaryUploadWidget from "../../../utils/CloudinaryUploadWidget";
import { CATEGORY, STATUS, SIZE } from "../../../constants/product.constants";
import "../style/adminProduct.style.css";
import {
  clearError,
  createProduct,
  editProduct,
  getProductList,
} from "../../../features/product/productSlice";

const InitialFormData = {
  name: "",
  sku: "",
  stock: {}, // 실제로 저장할 땐 객체 타입 (읽어오기 편함)
  image: "",
  description: "",
  category: [],
  status: "active",
  price: 0,
};

const NewItemDialog = ({ mode, showDialog, setShowDialog }) => {
  const { error, success, selectedProduct } = useSelector(
    (state) => state.product
  );
  const [formData, setFormData] = useState(
    mode === "new" ? { ...InitialFormData } : selectedProduct
  );
  const [stock, setStock] = useState([]); //편하게 데이터를 저장하기 위해 array타입으로 따로 저장
  console.log("stock ",stock);
  const dispatch = useDispatch();
  const [stockError, setStockError] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  //상품 등록 성공하면 다이얼로그 닫고, 상품 목록 다시 가져오기
  useEffect(() => {
    console.log("sss ",success);
    if (success) setShowDialog(false);
    dispatch(getProductList({page:1,pageSize:5}));
  }, [success]);
  
  useEffect(() => {
    if (error || !success) {
      dispatch(clearError());
    }
    if (showDialog) {
      if (mode === "edit") {
        setFormData(selectedProduct);
        // 객체형태로 온 stock을  다시 배열로 세팅해주기
        const sizeArray = Object.keys(selectedProduct.stock).map((size) => [
          size,
          selectedProduct.stock[size],
        ]);
        setStock(sizeArray);
      } else {
        setFormData({ ...InitialFormData });
        setStock([]);
      }
    }
  }, [showDialog]);

  const handleClose = () => {
    //모든걸 초기화시키고;
    setFormData({ ...InitialFormData });
    setStock([]);
    setStockError(false);
    setImageError(false);
    // 다이얼로그 닫아주기
    setShowDialog(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    //formData 확인
    console.log("formData ",formData);
    //재고를 입력했는지 확인, 아니면 에러
    if(stock.length === 0) return setStockError(true);
    // 재고를 배열에서 객체로 바꿔주기
    // [['M',2]] 에서 {M:2}로
    const totalStock = stock.reduce((total,item)=>{
      return {...total,[item[0]]:parseInt(item[1])} //배열의 각 값을 가져와서 객체 형태로 저장
    },{})
    // 이미지 업로드 확인
    if(formData.image === ""){
      return setImageError(true);
    }
    
    if (mode === "new") {
      //새 상품 만들기
      dispatch(createProduct({...formData, stock:totalStock}));
    } else {
      // 상품 수정하기
      dispatch(
        editProduct({...formData, stock:totalStock, id:selectedProduct._id})
      );
    }
    if (success) setShowDialog(false);
  };

  const handleChange = (event) => {
    //form에 데이터 넣어주기
    const {id,value} = event.target;
    setFormData({...formData, [id]:value});
    
  };

  const addStock = () => {
    //재고타입 추가시 배열에 새 배열 추가
    setStockError(false);
    setStock([...stock, []]);
  };

  const deleteStock = (idx) => {
    //재고 삭제하기
    const newStock = stock.filter((item,index)=>index !== idx);
    setStock(newStock);
  };

  const handleSizeChange = (value, index) => {
    //재고 사이즈 변환하기
    const newStock = [...stock];
    newStock[index][0] = value;
    setStock(newStock);
  };

  const handleStockChange = (value, index) => {
    //재고 수량 변환하기
    const newStock = [...stock];
    newStock[index][1] = value;
    setStock(newStock);
  };

  const onHandleCategory = (event) => {
    //카테고리 이미 존재 => 제거
    if (formData.category.includes(event.target.value)) {
      const newCategory = formData.category.filter(
        (item) => item !== event.target.value
      );
      setFormData({
        ...formData,
        category: [...newCategory],
      });
      //아니면 추가
    } else {
      setFormData({
        ...formData,
        category: [...formData.category, event.target.value],
      });
    }
  };

  const uploadImage = (url) => {
    //이미지 업로드
    setFormData({...formData,image:url});
    if(url !== ""){
      setImageError(false);
    }
  };

  return (
    <Modal show={showDialog} onHide={handleClose}>
      <Modal.Header closeButton>
        {mode === "new" ? (
          <Modal.Title>Create New Product</Modal.Title>
        ) : (
          <Modal.Title>Edit Product</Modal.Title>
        )}
      </Modal.Header>
      {error && (
        <div className="error-message">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}
      {imageError && (
        <div className="error-message">
          <Alert variant="danger">이미지를 추가해주세요</Alert>
        </div>
      )}
      <Form className="form-container" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="sku">
            <Form.Label>Sku</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Enter Sku"
              required
              value={formData.sku}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Name"
              required
              value={formData.name}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="string"
            placeholder="Description"
            as="textarea"
            onChange={handleChange}
            rows={3}
            value={formData.description}
            required
          />
        </Form.Group>

        {/* 재고 추가 영역 */}
        <Form.Group className="mb-3" controlId="stock">
          <Form.Label className="mr-1">Stock</Form.Label>
          {stockError && (
            <span className="error-message">재고를 추가해주세요</span>
          )}
          <Button size="sm" onClick={addStock}>
            Add +
          </Button>
          <div className="mt-2">
            {stock.map((item, index) => (
              <Row key={index}>
                <Col sm={4}>
                  <Form.Select
                    onChange={(event) =>
                      handleSizeChange(event.target.value, index)
                    }
                    required
                    defaultValue={item[0] ? item[0].toLowerCase() : ""}
                  >
                    <option value="" disabled selected hidden>
                      Please Choose...
                    </option>
                    {SIZE.map((item, index) => (
                      <option
                        inValid={true}
                        value={item.toLowerCase()}
                        disabled={stock.some(
                          (size) => size[0] === item.toLowerCase()
                        )}
                        key={index}
                      >
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                {/* 사이즈별 재고 수량 */}
                <Col sm={6}>
                  <Form.Control
                    onChange={(event) =>
                      handleStockChange(event.target.value, index)
                    }
                    type="number"
                    placeholder="number of stock"
                    value={item[1] || ""}
                    required
                  />
                </Col>
                {/* 재고 삭제 버튼 */}
                <Col sm={2}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteStock(index)}
                  >
                    -
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Form.Group>
        
        {/* 이미지 업로드 */}
        <Form.Group className="mb-3" controlId="Image" required>
          <Form.Label>Image</Form.Label>
          <CloudinaryUploadWidget uploadImage={uploadImage} />

          <img
            id="uploadedimage"
            src={formData.image}
            className="upload-image mt-2"
            alt="uploadedimage"
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              value={formData.price}
              required
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
          </Form.Group>

          {/* 카테고리 */}
          <Form.Group as={Col} controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              multiple
              onChange={onHandleCategory}
              value={formData.category}
              required
            >
              {CATEGORY.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange}
              required
            >
              {STATUS.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Row>
        {mode === "new" ? (
          <Button variant="primary" type="submit">
            Submit
          </Button>
        ) : (
          <Button variant="primary" type="submit">
            Edit
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default NewItemDialog;
