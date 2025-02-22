const router = require('express').Router();

const Tickets = require('../tickets/tickets-model.js');
const Users = require('./users-model.js');

router.post('/tickets/:id', (req, res) => {
    const helper_id = req.user.id;
    const { id } = req.params;

    req.user.role === 'helper' ?
    Users.findAssignedTicketById(id)
        .then(ticket => {
            if (!ticket.length) {
                Users.assignTicket(helper_id, id)
                    .then(tickets => {
                        // Sets ticket assignment to true after assigning to helper
                        Tickets.update(id, { assigned: true })
                        res.status(200).json(tickets);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ message: "Failed to assign ticket." })
                    })
            } else res.status(400).json({ message: "Ticket has already been assigned." })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Error assigning the ticket." })
        })
    : res.status(400).json({ message: "Ticket assignment restricted to helpers only." });
});

router.put('tickets/:id/resolved', (req, res) => {
    const { id } = req.params;
    const { solution } = req.body;

    req.user.role === 'helper' ?

    Tickets.findById(id)
        .then(ticket => {
            if (ticket) {
                // Sets ticket to resolved along with the included ticket solution
                Tickets.update(id, { solution, resolved: true })
                    .then(updatedTicket => {
                        res.status(200).json(updatedTicket)
                    });
            } else res.status(404).json({ message: "Ticket not found." });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Error updating the ticket." })
        })
    : res.status(400).json({ message: "Ticket updating restricted to helpers." });
});

module.exports = router;
