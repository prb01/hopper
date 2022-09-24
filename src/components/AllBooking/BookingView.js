import React from 'react'
import { Card, FormGroup, Label, Input } from 'reactstrap'

export default function BookingView({filter, setFilter}) {
  return (
        <Card className="shadow mb-1 p-3">
            <h5 className="text-muted">Reports</h5>
            <h3 className="mb-5">Bookings</h3>
            {/* <input value={filter || ''} onChange={(e) => setFilter(e.target.value)}/> */}
            <FormGroup>
                <Input
                id="exampleSearch"
                name="search"
                placeholder="search..."
                type="search"
                value={filter || ""}
                onChange={(e) => setFilter(e.target.value)}
                />
            </FormGroup>
        </Card>

  )
}
