import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { useSearchParams, useNavigate } from "react-router-dom";
import OrderDetailDialog from "./component/OrderDetailDialog";
import OrderTable from "./component/OrderTable";
import SearchBox from "../../common/component/SearchBox";
import {
  getOrderList,
  setSelectedOrder,
} from "../../features/order/orderSlice";
import "./style/adminOrder.style.css";

const AdminOrderPage = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const dispatch = useDispatch();
  const orderList = useSelector((state) => state.order.orderList);
  const totalPageNum = useSelector((state) => state.order.totalPageNum);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    ordernum: query.get("ordernum") || "",
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  const tableHeader = [
    "#",
    "Order#",
    "Order Date",
    "User",
    "Order Item",
    "Address",
    "Total Price",
    "Status",
  ];

  useEffect(() => {
    setLoading(true); // 로딩 시작
    dispatch(getOrderList({ ...searchQuery }))
    .finally(() => setLoading(false)); // 로딩 완료
  }, [query]);

  useEffect(() => {
    if (searchQuery.ordernum === "") {
      delete searchQuery.ordernum;
    }
    const params = new URLSearchParams(searchQuery);
    const queryString = params.toString();

    navigate("?" + queryString);
  }, [searchQuery]);

  const openEditForm = (order) => {
    setOpen(true);
    dispatch(setSelectedOrder(order));
  };

  const handlePageClick = ({ selected }) => {
    setSearchQuery({ ...searchQuery, page: selected + 1 });
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(handlePageClick({selected:0}));
  };

  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2 display-center mb-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="오더번호"
            field="ordernum"
          />
        </div>
        {loading ? (
          <div className="text-align-center empty-bag">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
          ) :
          <OrderTable
            header={tableHeader}
            data={orderList}
            openEditForm={openEditForm}
          />
         }
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum}
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

      {open && <OrderDetailDialog open={open} handleClose={handleClose} />}
    </div>
  );
};

export default AdminOrderPage;
