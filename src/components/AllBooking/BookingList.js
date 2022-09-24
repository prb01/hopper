import React, { useMemo, useEffect } from 'react'
import { COLUMNS } from './columns'
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table'
import "./BookingList.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import BookingView from './BookingView';
import { ButtonGroup, Button, ButtonToolbar } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllBookings, getData } from 'redux/booking'

export default function BookingList() {
  const dispatch = useDispatch();
  const {data: bookingdata, isLoaded, hasErrors} = useSelector(state => state.booking)
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => bookingdata, [bookingdata]);
  // console.log(bookingdata)

  let totalAmount = 0;
  for (let booking of bookingdata) {
    let total = booking?.order.products.reduce(
      (sum, { price, quantity }) => sum + price * quantity,
      0
    )
    totalAmount += total
  }
  console.log(tickets)
  // console.log(totalAmount)
  let tickets = 0;
  for (let booking of bookingdata) {
    let sale = booking?.order.products.filter(({type}) => type == 'product')
    .reduce((sum, {quantity}) => sum + quantity,
    0)
    tickets += sale
  }

  /* this sort is not fully working */
  const customTimeSort = (rowA, rowB, id, desc) => {
    // console.log(rowA.values[id])
    let valueA = rowA.values[id].sort()[rowA.values[id].length - 1];
    let valueB = rowB.values[id].sort()[rowA.values[id].length - 1];
    // console.log(valueA, valueB)
    if (valueA == undefined ) {
      valueA = desc ? "ZZZZZZZ" : "0000000";
    }
    if (valueB == undefined ) {
      valueB = desc ? "ZZZZZZ" : "0000000";
    }
    // console.log(rowA.values[id].sort()[rowA.values[id].length - 1])
    console.log(valueA < valueB, valueA, valueB)
    if (valueA >valueB) return 1;
    if (valueB > valueA) return -1;
     return 0;
}

  const sortTypes = {
    customTimeSort: customTimeSort,
  };

  useEffect(() => {
    dispatch(fetchAllBookings())
  }, [dispatch])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    prepareRow,
    state,
    setGlobalFilter
  } = useTable({
    columns,
    data,
    sortTypes
  }, useGlobalFilter, useSortBy, usePagination);

  const { globalFilter, pageIndex, pageSize } = state;

  // const handleClick = () => {
  //   const element = document.getElementById('extra');
  //   element.style.display = 'block';
  //   console.log('clicked')
  // }


  return (
    <>
    <BookingView filter={globalFilter} setFilter={setGlobalFilter}/>
    <div className="d-flex justify-content-start mb-5">
      <div className="mr-5">
        <h5 className="mb-0">$ {totalAmount.toFixed(2)}</h5>
        <span>Sales</span>
      </div>
      <div>
        <h5 className="mb-0">{tickets}</h5>
        <span>Tickets</span>
      </div>
    </div>
    <table className="mytable" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => {
          return (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => {
              return (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? <FontAwesomeIcon icon={faArrowDown}/> : <FontAwesomeIcon icon={faArrowUp}/>) : ""}
                </span>
              </th>
              )
            })}
            
          </tr>
          )
        })}
        
      </thead>
      <tbody {...getTableBodyProps()}>
        {page.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return(
                
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                )
              })}
              
            </tr>
          )
        })}
        
      </tbody>
    </table>
    <div className='d-flex justify-content-between mt-1'>
      <ButtonToolbar>
        <ButtonGroup>
          {[5,10,15].map((pageSize) => {
            return (
              <Button className="btn-light border " onClick={() => setPageSize(pageSize)}>{pageSize}</Button>
            )
          })}
        </ButtonGroup>
      </ButtonToolbar>
      <span className="mr-3">
        Go to Page {" "}
        <input type="number" defaultValue={pageIndex + 1} style={{width: 40}}
          onChange={(e) => {
            const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(pageNumber)
          }}/>
      </span>
      <div>
        <span>
          Page {" "}<strong>{pageIndex +1 } of {pageOptions.length}</strong>
        </span>
        <ButtonGroup className="ml-2">
          <Button className="btn-light border" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </Button>
          <Button className="btn-light border" onClick={() => previousPage()} disabled={!canPreviousPage}>
            Prev
          </Button>
          <Button className="btn-light border"onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </Button>
          <Button className="btn-light border " onClick={() => gotoPage(pageCount-1)} disabled={!canNextPage}>
            {">>"}
          </Button>
        </ButtonGroup>
        </div>
    </div>
    </>
  )
}
