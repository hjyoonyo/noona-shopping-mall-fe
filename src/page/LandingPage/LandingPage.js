import React, { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container, Spinner  } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../features/product/productSlice";
import ReactPaginate from "react-paginate";
import SearchBox from "../../common/component/SearchBox";

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productList = useSelector((state) => state.product.productList);
  const [query] = useSearchParams();
  const name = query.get("name");
  const totalPageNum = useSelector((state) => state.product.totalPageNum);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    name: name || "",
    pageSize: 12,
  }); //검색 조건들을 저장하는 객체

  // useEffect(() => {
  //   dispatch(
  //     getProductList({
  //       name,
  //     })
  //   );
  // }, [query]);

  //상품리스트 가져오기 (url쿼리 맞춰서)
  useEffect(()=>{
    setLoading(true); // 로딩 시작
    dispatch(getProductList({...searchQuery}))
    .finally(() => setLoading(false)); // 로딩 완료
  },[query])

  //검색어나 페이지가 바뀌면 url바꿔주기
  useEffect(() => {
    if(searchQuery.name === ""){
      delete searchQuery.name;
    }
    const params = new URLSearchParams(searchQuery);
    const query = params.toString();
    navigate("?"+query);
  }, [searchQuery]);

  const handlePageClick = ({ selected }) => {
    // 쿼리에 페이지값 바꿔주기
    setSearchQuery({...searchQuery,page:selected+1});
  };

  return (
    <Container>
      
      <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 검색"
            field="name"     
      />
      <div style={{ marginBottom: 20 }}></div>
      <Row>
      {loading ? (
        <div className="text-align-center empty-bag">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
        ) :
          productList.length > 0 ? (
            productList.map((item) => (
              <Col md={3} sm={12} key={item._id}>
                <ProductCard item={item} />
              </Col>
            ))
          ) : (
            <div className="text-align-center empty-bag">
              {name === "" ? (
                <h2>등록된 상품이 없습니다!</h2>
              ) : (
                <h2>{name}과 일치한 상품이 없습니다!</h2>
              )}
            </div>
          )
       }
      
      </Row>

      <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5} //보여줄 페이지 수
          pageCount={totalPageNum} //전체 페이지. be에서 가져옴.
          forcePage={searchQuery.page - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      
    </Container>
  );
};

export default LandingPage;
