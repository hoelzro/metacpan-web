package MetaCPAN::Web::Controller::Annotation;
use strict;
use warnings;
use base 'MetaCPAN::Web::Controller';

use JSON qw(decode_json);

use namespace::clean;

sub logged_in {
    return 1;
}

sub authorized {
    return 1;
}

sub unimplemented {
    my ( $self, $req ) = @_;

    return $req->new_response(501, { 'Content-Type' => 'text/plain' },
        'Unimplemented');
}

sub get_annotation {
    my ( $self, $req ) = @_;

    return $self->unimplemented($req);
}

sub post_annotation {
    my ( $self, $req ) = @_;

    my $body = $req->body;
    my $json = do {
        local $/;
        <$body>;
    };

    my $res       = $req->new_response;
    my $logged_in = $self->logged_in;

    $res->content_type('text/plain');
    if($logged_in && $self->authorized($req)) {
        eval {
            $json = decode_json($json);
        };
        if($@) {
            $res->status(400);
            $res->body('Bad JSON');
        } else {
            $res->status(200);
            $res->content_type('application/json; charset=utf-8');
            $res->body('true');
        }
    } else {
        if($logged_in) {
           $res->status(403);
           $res->body('Forbidden');
        } else {
           $res->status(401);
           $res->body('Unauthorized');
        }
    }

    return $res;
}

sub put_annotation {
    my ( $self, $req ) = @_;

    return $self->unimplemented($req);
}

sub delete_annotation {
    my ( $self, $req ) = @_;

    return $self->unimplemented($req);
}

sub bad_method {
    my ( $self, $req ) = @_;

    return $req->new_response(405, { 'Content-Type' => 'text/plain' },
        'Method Not Allowed');
}

sub index {
    my ( $self, $req ) = @_;
    my $cv = AE::cv;

    my $method = $req->method;
    my $res;

    if($method eq 'GET') {
        $res = $self->get_annotation($req);
    } elsif($method eq 'POST') {
        $res = $self->post_annotation($req);
    } elsif($method eq 'PUT') {
        $res = $self->put_annotation($req);
    } elsif($method eq 'DELETE') {
        $res = $self->delete_annotation($req);
    } else {
        $res = $self->bad_method($req);
    }

    $cv->send($res);

    return $cv;
}

sub raw { 1 }

# GET    /annotation/Plack::Middleware   - lists annotations
# GET    /annotation/Plack::Middleware/1 - retrieves a single annotation
# PUT    /annotation/Plack::Middleware/1 - Updates an annotation
# POST   /annotation/Plack::Middleware/1 - Updates an annotation
# DELETE /annotation/Plack::Middleware/1 - Removes an annotation
# POST   /annotation/Plack::Middleware/  - Creates an annotation

1;
